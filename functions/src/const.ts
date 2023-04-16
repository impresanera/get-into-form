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

export type Struct = {
  forms_dev: FormStruct;
  forms_stg: FormStruct;
  forms_prd: FormStruct;
  forms_uat: FormStruct;

  // users_dev: "";
  // users_stg: "";
  // users_prd: "";
  // users_uat: "";
};
export type DocPath = PathIntoRecord<Struct, "/">;

type FormInputData = (Record<string, string> & {
  id: string;
})[];

type FormStruct = {
  name: string;
  id: string;
  form_data: FormInputData;
  createdAt: string;
};

type PathIntoRecord<
  T extends Record<string, any>,
  Delemiter extends string = "."
> = keyof {
  [K in keyof T as T[K] extends any[] | number | string | boolean | symbol
    ? K
    : T[K] extends Record<string, any>
    ? `${K & string}${Delemiter}${PathIntoRecord<T[K]> & string}`
    : never]: any;
};
