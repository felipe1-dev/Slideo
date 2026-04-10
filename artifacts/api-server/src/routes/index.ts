import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import slidesRouter from "./slides";
import userRouter from "./user";
import paymentsRouter from "./payments";
import path from "path";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/slides", slidesRouter);
router.use("/user", userRouter);
router.use("/payments", paymentsRouter);

router.get("/download", (_req, res) => {
  res.download(path.join("/tmp", "slideo.tar.gz"), "slideo.tar.gz");
});

export default router;
