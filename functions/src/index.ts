import * as functions from "firebase-functions";
import * as express from "express";
import * as crypto from "crypto";
import type { Response, Request, NextFunction } from "express";
import * as firebaseAdmin from "firebase-admin";

firebaseAdmin.initializeApp();
const db = firebaseAdmin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const DB_STRUCT = {
  col: {
    name: "forms",
    doc: {
      col: {
        name: "form_data",
      },
    },
  },
};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, _: Response, next: NextFunction) => {
  functions.logger.info("App log", { url: req.url, method: req.method });
  next();
});

// create form
app.post<"/form", unknown, unknown, { name: string }>(
  "/form",
  async (req, res) => {
    functions.logger.info("Create from", {
      ...req.body,
      id: crypto.randomUUID(),
    });

    const _doc = await db.collection(DB_STRUCT.col.name).add({
      name: req.body.name,
    });

    await _doc.update({ id: _doc.id });
    const doc = await db.doc(_doc.path).get();

    res.send(doc.data());
  }
);

// get all form data for a specific form
app.get("/form/:id", async (req, res) => {
  functions.logger.info("Get from by id");
  const formData = await db
    .collection(DB_STRUCT.col.name)
    .doc(req.params.id)
    .collection("form_data")
    .get();

  res.send(formData.docs.map((e) => e.data()));
});

// add form data
app.post("/form/:id", async (req, res) => {
  functions.logger.info("Insert to form!");

  const formData = await db
    .collection(DB_STRUCT.col.name)
    .doc(req.params.id)
    .collection(DB_STRUCT.col.doc.col.name)
    .add(req.body);
  const data = (await formData.get()).data();

  res.send(data);
});

export const form = functions.https.onRequest(app);
