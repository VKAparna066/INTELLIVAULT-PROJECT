import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import alertsRouter from "./alerts";
import auditRouter from "./audit";
import statsRouter from "./stats";
import foldersRouter from "./folders";
import contactRouter from "./contact";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(alertsRouter);
router.use(auditRouter);
router.use(statsRouter);
router.use(foldersRouter);
router.use(contactRouter);
router.use(authRouter);

export default router;
