import { z } from "zod";

const isRequiredMessage = (name: string): string => `[${name} is required]`;

export const createFormAutomation = z.object({
  type: z.enum(["EMAIL"], { required_error: isRequiredMessage("type") }),
  provider: z.enum(["MAILGUN"], {
    required_error: isRequiredMessage("provider"),
  }),
  apiKey: z.string({ required_error: isRequiredMessage("apiKey") }),
  domain: z.string({ required_error: isRequiredMessage("domain") }),
  sender: z
    .string({
      required_error: isRequiredMessage("sender"),
    })
    .regex(/^[a-zA-Z]+(\s[a-zA-Z]+)?\s<.+>/, {
      message: "[sender] is invalide. Use the email name format 'name <email>'",
    }),
  receiverType: z.enum(["FIXED", "FORM_DATA"], {
    required_error: isRequiredMessage("receiverType"),
  }),
  receiver: z.string({
    required_error: isRequiredMessage("receiver"),
  }),
  emailSourceType: z.enum(["TEMPLATE"], {
    required_error: isRequiredMessage("emailSourceType"),
  }),
  emailSourceValue: z.string({
    required_error: isRequiredMessage("emailSourceValue"),
  }),
  name: z.string({ required_error: isRequiredMessage("name") }),
  emailSubject: z.string({
    required_error: isRequiredMessage("emailSubject"),
  }),
  replyTo: z
    .string({ required_error: isRequiredMessage("replyTo") })
    .optional()
    .nullable()
    .default(null),
  trigger: z.array(z.enum(["ON_DATA_ADDED"])),
});
// .refine((val) => {
//   if (val.receiverType === "FIXED") {
//     z.string()
//       .email({ message: "[receiver] is not a valid email." })
//       .safeParse(val.receiver);
//   }
// });

export type CreateEmailAutomationPayload = z.infer<typeof createFormAutomation>;
