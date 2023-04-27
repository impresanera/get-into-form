import * as functions from "firebase-functions";
import express from "express";
import type { Response, Request, NextFunction } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, _: Response, next: NextFunction) => {
  functions.logger.info("App log", { url: req.url, method: req.method });
  next();
});

export { app };
