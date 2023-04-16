import formData from "form-data";
import Mailgun from "mailgun.js";
import { db } from "../firebase";
import { appendEnv } from "../config";
import Client from "mailgun.js/client";
import { MAILGUN_EMAIL_AUTOMATION, DS } from "../automation";
// add automation to form with form id

type RunMailgunAutomationArgs = [
  {
    from: string;
    to: string;
  },
  {
    formId: string;
    formDataId: string;
    domain: string;
    api_key: string;
    email_data_type: MAILGUN_EMAIL_AUTOMATION["meta"]["email_data"]["type"];
    email_data_value: string;
  }
];

export async function runMailgunAutomation(
  payload: RunMailgunAutomationArgs[0],
  meta: RunMailgunAutomationArgs[1]
): Promise<void> {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: meta.api_key,
  });

  const docPath = `${appendEnv("forms")}/${meta.formId}/form_data/${
    meta.formDataId
  }`;
  const formPath = `${appendEnv("forms")}/${meta.formId}`;
  const doc = (await db.doc(docPath).get()).data();
  const formInfo = (await db.doc(formPath).get()).data() as DS["forms"][0];

  if (!doc || !formInfo) {
    throw Error("Record not found");
  }

  switch (meta.email_data_type) {
    case "HTML":
      mailgunHtml({
        mg,
        domain: meta.domain,
        from: payload.from,
        to: payload.to,
        html: meta.email_data_value,
      });
      break;
    case "TEMPLATE":
      mailgunTemplate({
        mg,
        domain: meta.domain,
        from: payload.from,
        to: payload.to,
        template: meta.email_data_value,
        variables: doc,
      });
      break;
    case "TEXT":
      mailgunText({
        mg,
        domain: meta.domain,
        from: payload.from,
        to: payload.to,
        text: meta.email_data_value,
      });
      break;
    default:
      throw new Error("Invalid email type");
  }
}

type MailgunMessageTextArgs = {
  mg: Client;
  to: string;
  from: string;
  text: string;
  domain: string;
};
async function mailgunText(args: MailgunMessageTextArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    text: args.text,
  });
}

type MailgunMessageHTMLArgs = {
  mg: Client;
  to: string;
  from: string;
  html: string;
  domain: string;
};
async function mailgunHtml(args: MailgunMessageHTMLArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    html: args.html,
  });
}

type MailgunMessageTemplateArgs = {
  mg: Client;
  to: string;
  from: string;
  template: string;
  domain: string;
  variables: Record<string, string>;
};
async function mailgunTemplate(args: MailgunMessageTemplateArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    "h:X-Mailgun-Variables": args.variables,
    template: args.template,
  });
}
// mg.c.messages.create('sandbox-123.mailgun.org', {
//     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
//     to: ["test@example.com"],
//     subject: "Hello",
//     text: "Testing some Mailgun awesomness!",
//     html: "<h1>Testing some Mailgun awesomness!</h1>"
//   })
//   .then(msg => console.log(msg)) // logs response data
//   .catch(err => console.error(err)); // logs any error
