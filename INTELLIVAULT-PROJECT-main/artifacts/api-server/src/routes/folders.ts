import { Router, type IRouter } from "express";
import { db, foldersTable, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin + "intellivault_salt").digest("hex");
}

router.get("/folders", async (req, res) => {
  try {
    const folders = await db.select().from(foldersTable);
    const result = folders.map(f => ({ ...f, pinHash: undefined, decoyPinHash: undefined }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list folders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/folders", async (req, res) => {
  try {
    const { name, pin, decoyPin, isHidden } = req.body;
    const [folder] = await db.insert(foldersTable).values({
      name,
      pinHash: pin ? hashPin(String(pin)) : null,
      decoyPinHash: decoyPin ? hashPin(String(decoyPin)) : null,
      isPinEnabled: !!pin,
      isHidden: isHidden || false,
    }).returning();
    res.status(201).json({ ...folder, pinHash: undefined, decoyPinHash: undefined });
  } catch (err) {
    req.log.error({ err }, "Failed to create folder");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/folders/:id/verify-pin", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { pin } = req.body;
    const [folder] = await db.select().from(foldersTable).where(eq(foldersTable.id, id));
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    if (folder.lockedUntil && new Date() < new Date(folder.lockedUntil)) {
      return res.status(403).json({ error: "Folder locked due to failed attempts", locked: true });
    }

    const hashed = hashPin(String(pin));

    if (folder.decoyPinHash && hashed === folder.decoyPinHash) {
      await db.update(foldersTable).set({ failedAttempts: 0, lockedUntil: null }).where(eq(foldersTable.id, id));
      return res.json({ access: "decoy", message: "Decoy vault accessed" });
    }

    if (hashed === folder.pinHash) {
      await db.update(foldersTable).set({ failedAttempts: 0, lockedUntil: null }).where(eq(foldersTable.id, id));
      return res.json({ access: "granted", message: "Access granted" });
    }

    const attempts = (folder.failedAttempts || 0) + 1;
    const lockedUntil = attempts >= 3 ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null;
    await db.update(foldersTable).set({ failedAttempts: attempts, lockedUntil }).where(eq(foldersTable.id, id));

    return res.status(401).json({
      error: "Incorrect PIN",
      attemptsLeft: Math.max(0, 3 - attempts),
      locked: !!lockedUntil
    });
  } catch (err) {
    req.log.error({ err }, "Failed to verify PIN");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/folders/:id/documents", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const docs = await db.select().from(documentsTable).where(eq(documentsTable.folderId, id));
    res.json(docs);
  } catch (err) {
    req.log.error({ err }, "Failed to get folder documents");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/folders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(foldersTable).where(eq(foldersTable.id, id));
    res.json({ success: true, message: "Folder deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete folder");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
