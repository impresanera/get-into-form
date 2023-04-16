import { auth } from "firebase-admin";
import { db, functions } from "../firebase";
import cors from "cors";
import { DB_STRUCT } from "../const";
import { FieldValue } from "firebase-admin/firestore";

const corsHandler = cors();

export const getIsFirstUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const { users } = await auth().listUsers();

    const isFirstUser = users.length < 1;
    functions.logger.info({ isFirstUser });
    res.json(isFirstUser);
  });
});

export const newUserSignUp = functions.auth.user({}).onCreate(async (u) => {
  const oldUserDoc = await db
    .collection(DB_STRUCT.col.names.users)
    .doc(u.uid)
    .get();

  if (oldUserDoc.data()) {
    return;
  }

  await db.collection(DB_STRUCT.col.names.users).doc(u.uid).create({
    id: u.uid,
    createdAt: FieldValue.serverTimestamp(),
  });
});
