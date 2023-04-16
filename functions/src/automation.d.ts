export type DS = {
  forms: Array<{
    name: string;
    id: string;
    form_data: Record<string, string> & { id: string }[];
    createdAt: string;
    automation: Automation[];
  }>;
};

export type MAILGUN_EMAIL_AUTOMATION = {
  name: string;
  id: string;
  type: "EMAIL";
  provider: "MAILGUN";
  secret: { api_key: string; domain: string };
  meta: {
    email_data: { type: "TEMPLATE" | "TEXT" | "HTML"; value: string };
    sender: string;
    receiver:
      | { type: "FIXED"; address: string }
      | { type: "FORM_DATA"; form_field: string };
  };
  trigger: AutomationTriggers[];
};

export type Automation = MAILGUN_EMAIL_AUTOMATION;

export type AutomationTriggers = "ON_DATA_ADDED" | "ON_DATA_REMOVED";
