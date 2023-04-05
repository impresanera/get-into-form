import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { app } from "../app";
import { db } from "../firebase";
import { DB_STRUCT } from "../const";

// create form
app.post<"/", unknown, unknown, { name: string }>("/", async (req, res) => {
  functions.logger.info("Create from", {
    ...req.body,
  });

  //
  const docRef = await db.collection(DB_STRUCT.col.name).add({
    name: req.body.name,
    createdAt: FieldValue.serverTimestamp(),
  });

  await docRef.update({ id: docRef.id });
  const doc = await db.doc(docRef.path).get();

  res.send(doc.data());
});

app.get("/", async (req, res) => {
  functions.logger.info("Get all forms");
  const formData = await db.collection(DB_STRUCT.col.names.forms).get();

  res.send(formData.docs.map((e) => e.data()));
});

app.get("/:id", async (req, res) => {
  functions.logger.info("Get form by id");
  const formData = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .get();

  res.send(formData.data());
});

app.delete("/:id", async (req, res) => {
  functions.logger.info("delete form by id");
  const form = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id);

  const data = (await form.get()).data();
  await form.delete();

  res.send(data);
});

// get all form data for a specific form
app.get("/:id/form-data", async (req, res) => {
  functions.logger.info("Get form data by id");
  const formData = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .collection(DB_STRUCT.col.doc.col.names.form_data)
    .get();

  res.send(formData.docs.map((e) => e.data()));
});

// add form data
app.post("/:id", async (req, res) => {
  functions.logger.info("Insert to form!");
  const docRef = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .get();

  if (!docRef.data()) {
    res.status(400).send({
      message: `Form ${req.params.id} does not exist`,
      name: "BadRequest",
    });
    return;
  }

  const formData = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .collection(DB_STRUCT.col.doc.col.names.form_data)
    .add({
      ...req.body,
      createdAt: FieldValue.serverTimestamp(),
    });
  await formData.update({ id: formData.id });

  const data = (await formData.get()).data();

  res.send(data);
});

export const forms = functions.https.onRequest(app);
