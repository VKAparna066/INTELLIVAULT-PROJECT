import { Router, type IRouter } from "express";
import { db, documentsTable, alertsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(documentsTable).where(eq(documentsTable.isDeleted, false));
    const [encrypted] = await db.select({ count: sql<number>`count(*)` }).from(documentsTable).where(and(eq(documentsTable.isEncrypted, true), eq(documentsTable.isDeleted, false)));
    const [trashCount] = await db.select({ count: sql<number>`count(*)` }).from(documentsTable).where(eq(documentsTable.isDeleted, true));
    const allDocs = await db.select().from(documentsTable).where(eq(documentsTable.isDeleted, false));
    const soon = allDocs.filter(d => {
      if (!d.expiryDate) return false;
      const diff = new Date(d.expiryDate).getTime() - Date.now();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    });
    const highRisk = allDocs.filter(d => d.fraudRisk === "high").length;
    res.json({
      totalDocuments: Number(total?.count || 0),
      encryptedDocuments: Number(encrypted?.count || 0),
      expiringDocuments: soon.length,
      trashedDocuments: Number(trashCount?.count || 0),
      highRiskDocuments: highRisk,
      storageUsed: 1024 * 1024 * 47,
      storageLimit: 1024 * 1024 * 1024,
      securityScore: 94,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
