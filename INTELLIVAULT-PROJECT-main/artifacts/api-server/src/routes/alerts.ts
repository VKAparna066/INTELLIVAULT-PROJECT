import { Router, type IRouter } from "express";
import { db, alertsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await db.select().from(alertsTable).orderBy(alertsTable.createdAt);
    res.json(alerts);
  } catch (err) {
    req.log.error({ err }, "Failed to list alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
