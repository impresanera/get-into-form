import { auth } from "firebase-admin";
import { functions } from "../firebase";
import * as cors from "cors";
const corsHandler = cors({ origin: true });

export const getIsFirstUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const { users } = await auth().listUsers();
    console.log(users);

    const isFirstUser = users.length < 1;
    functions.logger.info({ isFirstUser });
    res.json(isFirstUser);
  });
});
