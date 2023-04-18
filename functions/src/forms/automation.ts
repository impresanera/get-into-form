import formData from "form-data";
import Mailgun from "mailgun.js";
import { db } from "../firebase";
import Client from "mailgun.js/client";
import { MAILGUN_EMAIL_AUTOMATION, DS } from "../automation";
import { DB_STRUCT } from "../const";
// add automation to form with form id

type RunMailgunAutomationArgs = [
  {
    from: string;
    to: string;
    subject: string;
    replyTo: string | null;
  },
  {
    formId: string;
    formDataId: string;
    domain: string;
    api_key: string;
    email_data_type: MAILGUN_EMAIL_AUTOMATION["meta"]["email_source"]["type"];
    email_data_value: string;
    isEu: boolean;
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
    url: meta.isEu ? "https://api.eu.mailgun.net" : undefined,
  });

  const docPath = `${DB_STRUCT.col.names.forms}/${meta.formId}/form_data/${meta.formDataId}`;
  const formPath = `${DB_STRUCT.col.names.forms}/${meta.formId}`;
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
        subject: payload.subject,
        replyTo: payload.replyTo,
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
        subject: payload.subject,
        replyTo: payload.replyTo,
      });
      break;
    case "TEXT":
      mailgunText({
        mg,
        domain: meta.domain,
        from: payload.from,
        to: payload.to,
        text: meta.email_data_value,
        subject: payload.subject,
        replyTo: payload.replyTo,
      });
      break;
    default:
      throw new Error("Invalid email type");
  }
}

type MailgunMessage = {
  mg: Client;
  to: string;
  from: string;
  domain: string;
  subject: string;
  replyTo: string | null;
};

type MailgunMessageTextArgs = MailgunMessage & { text: string };
async function mailgunText(args: MailgunMessageTextArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    text: args.text,
    "h:Reply-To": args.replyTo || undefined,
  });
}

type MailgunMessageHTMLArgs = MailgunMessage & { html: string };
async function mailgunHtml(args: MailgunMessageHTMLArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    html: args.html,
    subject: args.subject,
    "h:Reply-To": args.replyTo || undefined,
  });
}

type MailgunMessageTemplateArgs = MailgunMessage & {
  template: string;
  variables: Record<string, string>;
};
async function mailgunTemplate(args: MailgunMessageTemplateArgs) {
  args.mg.messages.create(args.domain, {
    from: args.from,
    to: args.to,
    "h:X-Mailgun-Variables": JSON.stringify(args.variables),
    template: args.template,
    "h:Reply-To": args.replyTo || undefined,
    subject: args.subject,
  });
}

// new Mailgun(formData)
//   .client({
//     username: "api",
//     key: "<>",
//     url: "https://api.eu.mailgun.net",
//   })
//   .messages.create("mg.nerahubs.com", {
//     template: "application_successful",
//     "h:X-Mailgun-Variables": JSON.stringify({ name: "Micah Effiong" }),
//     subject: "Test",
//     to: "softwares@impresanera.com",
//     from: "Mailgun Sandbox <postmaster@mg.nerahubs.com>",
//   });
