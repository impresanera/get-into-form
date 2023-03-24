import * as functions from "firebase-functions";
import * as crypto from "crypto";
import { app } from "../app";
import { db } from "../firebase";
import { DB_STRUCT } from "../const";

// create form
app.post<"/", unknown, unknown, { name: string }>("/", async (req, res) => {
  functions.logger.info("Create from", {
    ...req.body,
    id: crypto.randomUUID(),
  });

  const docRef = await db.collection(DB_STRUCT.col.name).add({
    name: req.body.name,
  });

  await docRef.update({ id: docRef.id });
  const doc = await db.doc(docRef.path).get();

  res.send(doc.data());
});

// get all form data for a specific form
app.get("/:id", async (req, res) => {
  functions.logger.info("Get from by id");
  const formData = await db
    .collection(DB_STRUCT.col.name)
    .doc(req.params.id)
    .collection("form_data")
    .get();

  res.send(formData.docs.map((e) => e.data()));
});

// add form data
app.post("/:id", async (req, res) => {
  functions.logger.info("Insert to form!");
  const docRef = await await db.collection(DB_STRUCT.col.name).doc().get();

  if (!docRef.data()) {
    res.status(400).send({
      message: `Form ${req.params.id} does not exist`,
      name: "BadRequest",
    });
    return;
  }

  const formData = await db
    .collection(DB_STRUCT.col.name)
    .doc(req.params.id)
    .collection(DB_STRUCT.col.doc.col.name)
    .add(req.body);
  const data = (await formData.get()).data();

  res.send(data);
});

export const form = functions.https.onRequest(app);
