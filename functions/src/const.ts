import { appendEnv } from "./config";

export const DB_STRUCT = {
  col: {
    name: appendEnv("forms"),
    names: {
      forms: appendEnv("forms"),
      users: appendEnv("users"),
    },
    doc: {
      col: {
        name: "form_data",
        names: {
          form_data: "form_data",
        },
      },
    },
  },
} as const;
