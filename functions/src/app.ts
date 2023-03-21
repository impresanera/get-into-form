import * as functions from "firebase-functions";
import * as express from "express";
import type { Response, Request, NextFunction } from "express";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, _: Response, next: NextFunction) => {
  functions.logger.info("App log", { url: req.url, method: req.method });
  next();
});

export { app };
