import { Router, type IRouter } from "express";
import { db, auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await db.select().from(auditLogsTable).orderBy(auditLogsTable.timestamp);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to list audit logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
