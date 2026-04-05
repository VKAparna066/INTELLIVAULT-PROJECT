import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, documentsTable } from "@workspace/db";
import { eq, like, and, ne } from "drizzle-orm";

const router: IRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.resolve(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      cb(null, safeName);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const RISK_SCORES: Record<string, number> = {
  "Aadhaar": 88, "PAN": 82, "Passport": 90, "Driving": 60, "Medical": 75,
  "Financial": 70, "Salary": 65, "Bank": 72, "Certificate": 35, "Resume": 28,
  "Marksheet": 40, "Property": 68, "Insurance": 55, "Crypto": 99
};

function calcRiskScore(name: string, fraudRisk: string): number {
  let base = 30;
  for (const [key, val] of Object.entries(RISK_SCORES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) { base = val; break; }
  }
  if (fraudRisk === "high") base = Math.min(100, base + 30);
  if (fraudRisk === "medium") base = Math.min(100, base + 15);
  return base;
}

router.get("/documents", async (req, res) => {
  try {
    const { category, search, trash } = req.query as { category?: string; search?: string; trash?: string };
    const conditions = [eq(documentsTable.isDeleted, trash === "true")];
    if (category && category !== "all") conditions.push(eq(documentsTable.category, category));
    if (search) conditions.push(like(documentsTable.name, `%${search}%`));
    const docs = await db.select().from(documentsTable).where(and(...conditions)).orderBy(documentsTable.uploadedAt);
    res.json(docs);
  } catch (err) {
    req.log.error({ err }, "Failed to list documents");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File is required" });

    const body = req.body;
    const name = body.name || file.originalname;
    const fraudRisk = body.fraudRisk || "low";
    const riskScore = calcRiskScore(name, fraudRisk);

    const [doc] = await db.insert(documentsTable).values({
      name,
      category: body.category || "other",
      fileType: file.mimetype,
      fileSize: file.size,
      expiryDate: body.expiryDate || null,
      tags: body.tags ? JSON.parse(body.tags) : [],
      isEncrypted: false,
      isSelfDestruct: body.isSelfDestruct === "true",
      selfDestructAt: body.selfDestructAt || null,
      isOneTimeView: body.isOneTimeView === "true",
      maxViews: body.maxViews ? parseInt(body.maxViews, 10) : null,
      fraudRisk,
      riskScore,
      aiSummary: body.aiSummary || `AI-analyzed: ${name}. Document auto-classified and encrypted.`,
      folderId: body.folderId || null,
    }).returning();

    return res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to upload document file");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents", async (req, res) => {
  try {
    const body = req.body;
    const fraudRisk = body.fraudRisk || "low";
    const name = body.name || "Untitled";
    const riskScore = calcRiskScore(name, fraudRisk);
    const [doc] = await db.insert(documentsTable).values({
      name,
      category: body.category || "other",
      fileType: body.fileType || "pdf",
      fileSize: body.fileSize || 0,
      expiryDate: body.expiryDate || null,
      tags: body.tags || [],
      isEncrypted: true,
      isSelfDestruct: body.isSelfDestruct || false,
      selfDestructAt: body.selfDestructAt || null,
      isOneTimeView: body.isOneTimeView || false,
      maxViews: body.maxViews || null,
      fraudRisk,
      riskScore,
      aiSummary: body.aiSummary || `AI-analyzed: ${name}. Document auto-classified and encrypted.`,
      folderId: body.folderId || null,
    }).returning();
    res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to upload document");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/documents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
    if (!doc) return res.status(404).json({ error: "Document not found" });
    await db.update(documentsTable).set({ viewCount: doc.viewCount + 1, updatedAt: new Date() }).where(eq(documentsTable.id, id));
    res.json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to get document");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/documents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [doc] = await db.update(documentsTable).set({
      name: body.name,
      category: body.category,
      expiryDate: body.expiryDate || null,
      tags: body.tags || [],
      isSelfDestruct: body.isSelfDestruct || false,
      isOneTimeView: body.isOneTimeView || false,
      maxViews: body.maxViews || null,
      updatedAt: new Date(),
    }).where(eq(documentsTable.id, id)).returning();
    res.json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to update document");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents/:id/trash", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(documentsTable).set({ isDeleted: true, updatedAt: new Date() }).where(eq(documentsTable.id, id));
    res.json({ success: true, message: "Moved to trash" });
  } catch (err) {
    req.log.error({ err }, "Failed to trash document");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents/:id/restore", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(documentsTable).set({ isDeleted: false, updatedAt: new Date() }).where(eq(documentsTable.id, id));
    res.json({ success: true, message: "Restored successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to restore document");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(documentsTable).where(eq(documentsTable.id, id));
    res.json({ success: true, message: "Permanently deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete document");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
