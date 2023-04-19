import { z } from "zod";

const isRequiredMessage = (name: string): string => `[${name}] is required`;

export const createMailgunFormAutomation = z.object({
  type: z.enum(["EMAIL"], { required_error: isRequiredMessage("type") }),
  provider: z.enum(["MAILGUN"], {
    required_error: isRequiredMessage("provider"),
  }),
  apiKey: z
    .string({ required_error: isRequiredMessage("apiKey") })
    .trim()
    .min(1),
  domain: z
    .string({ required_error: isRequiredMessage("domain") })
    .trim()
    .min(1),
  sender: z
    .string({
      required_error: isRequiredMessage("sender"),
    })
    .trim()
    .min(1)
    .regex(/^[a-zA-Z]+(\s[a-zA-Z]+)?\s<.+>/, {
      message: "[sender] is invalid. Use the email name format 'name <email>'",
    }),
  receiverSource: z.enum(["FIXED", "FORM_DATA"], {
    required_error: isRequiredMessage("receiverType"),
  }),
  receiverValue: z
    .string({
      required_error: isRequiredMessage("receiver"),
    })
    .trim()
    .min(1),
  emailSourceType: z.enum(["TEMPLATE"], {
    required_error: isRequiredMessage("emailSourceType"),
  }),
  emailSourceValue: z
    .string({
      required_error: isRequiredMessage("emailSourceValue"),
    })
    .trim()
    .min(1),
  name: z
    .string({ required_error: isRequiredMessage("name") })
    .trim()
    .min(1),
  emailSubject: z
    .string({
      required_error: isRequiredMessage("emailSubject"),
    })
    .trim()
    .min(1),
  replyTo: z
    .string({ required_error: isRequiredMessage("replyTo") })
    .trim()
    .min(1)
    .optional()
    .nullable()
    .default(null),
  trigger: z.enum(["ON_DATA_ADDED"]).array().nonempty(),
  isEu: z.boolean().optional(),
});
// .refine((val) => {
//   if (val.receiverType === "FIXED") {
//     z.string()
//       .email({ message: "[receiver] is not a valid email." })
//       .safeParse(val.receiver);
//   }
// });

export type CreateMailgunEmailAutomationPayload = z.infer<
  typeof createMailgunFormAutomation
>;
