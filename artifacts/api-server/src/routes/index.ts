import { Router, type IRouter } from "express";
import healthRouter from "./health";
import componentsRouter from "./components";
import salesRouter from "./sales";
import suggestionsRouter from "./suggestions";
import analyticsRouter from "./analytics";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(componentsRouter);
router.use(salesRouter);
router.use(suggestionsRouter);
router.use(analyticsRouter);

export default router;
