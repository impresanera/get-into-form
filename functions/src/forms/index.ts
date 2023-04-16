import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { app } from "../app";
import { db } from "../firebase";
import { DB_STRUCT } from "../const";
import type { Request, Response } from "express";
import { appendEnv } from "../config";
import { Automation, DS } from "../automation";
import { runMailgunAutomation } from "./automation";

// create form
app.post<"/", Record<string, string>, null, { name: string }>(
  "/",
  async (req: Request, res: Response) => {
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
  }
);

app.get("/", async (_: Request, res: Response) => {
  functions.logger.info("Get all forms");
  const formData = await db.collection(DB_STRUCT.col.names.forms).get();

  res.send(formData.docs.map((e) => e.data()));
});

app.get("/:id", async (req: Request, res: Response) => {
  functions.logger.info("Get form by id");
  const formData = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .get();

  res.send(formData.data());
});

app.delete("/:id", async (req: Request, res: Response) => {
  functions.logger.info("delete form by id");
  const form = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id);

  const data = (await form.get()).data();
  await form.delete();

  res.send(data);
});

// get all form data for a specific form
app.get("/:id/form-data", async (req: Request, res: Response) => {
  functions.logger.info("Get form data by id");
  const formData = await db
    .collection(DB_STRUCT.col.names.forms)
    .doc(req.params.id)
    .collection(DB_STRUCT.col.doc.col.names.form_data)
    .get();

  res.send(formData.docs.map((e) => e.data()));
});

// add form data
app.post("/:id", async (req: Request, res: Response) => {
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

export const formAutomation = functions.firestore
  .document(`${appendEnv("forms")}/{formId}/form_data/{formDataId}`)
  .onCreate(async (snap, _context) => {
    const newValue = snap.data() as DS["forms"][0]["form_data"][0];
    functions.logger.log("runing automation", { newValue });
    // get parent automation
    const form = (
      await db.doc(`${appendEnv("forms")}/{formId}`).get()
    ).data() as DS["forms"][0];

    if (!form) {
      return;
    }

    executeAutomations(form.automation, form, newValue);
  });

function executeAutomations(
  automation: Automation[],
  form: DS["forms"][0],
  formData: DS["forms"][0]["form_data"][0]
) {
  automation.map((automation) => {
    if (automation.type === "EMAIL" && automation.provider === "MAILGUN") {
      // run email automation
      let to: string;

      if (automation.meta.receiver.type === "FIXED") {
        to = automation.meta.receiver.address;
      } else {
        const form_field = automation.meta.receiver
          .form_field as keyof typeof formData;
        to = formData[form_field];
      }

      runMailgunAutomation(
        {
          from: automation.meta.sender,
          to,
        },
        {
          api_key: automation.secret.api_key,
          domain: automation.secret.domain,
          email_data_type: automation.meta.email_data.type,
          email_data_value: automation.meta.email_data.value,
          formDataId: formData.id,
          formId: form.id,
        }
      );
    }
  });
}
