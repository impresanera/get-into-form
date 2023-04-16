import axios from "axios";
import { Result } from "..";
import { getFunctionUrl } from "../firebase/firebase";

export type FormType = { name: string; id: string };
export type CreateFormType = { name: string };
export type FormDataType = {
  id: string;
  [key: string]: unknown;
};

const basePaths = {
  forms: "forms",
  firstUser: "firstUser",
} as const;

export async function getForms(): Promise<Result<FormType[]>> {
  try {
    const res = await axios.get<FormType[]>(getFunctionUrl() + basePaths.forms);
    return { value: res.data, ok: true };
  } catch (error) {
    return { error, ok: false };
  }
}

export async function getFormData(
  formId: string
): Promise<Result<FormDataType[]>> {
  if (formId === "") {
    return { value: [], ok: true };
  }

  try {
    const res = await axios.get<FormDataType[]>(
      `${getFunctionUrl()}${basePaths.forms}/${formId}/form-data`
    );
    return { value: res.data, ok: true };
  } catch (error) {
    return { error, ok: false };
  }
}

export async function deleteForms(id: string): Promise<Result<FormType[]>> {
  try {
    const res = await axios.delete<FormType[]>(
      `${getFunctionUrl()}${basePaths.forms}/${id}`
    );
    return { value: res.data, ok: true };
  } catch (error) {
    return { error, ok: false };
  }
}

export async function createForms(
  createFormData: CreateFormType
): Promise<Result<FormType>> {
  try {
    const res = await axios.post<FormType>(
      getFunctionUrl() + basePaths.forms,
      createFormData
    );
    return { value: res.data, ok: true };
  } catch (error) {
    return { error, ok: false };
  }
}

export const getFirstUser = async (): Promise<Result<boolean>> => {
  try {
    const firstUrl = getFunctionUrl();
    console.log({ firstUrl });

    const res = await axios.get(getFunctionUrl() + basePaths.firstUser);
    return { value: res.data, ok: true };
  } catch (error) {
    return { error, ok: false };
  }
};

export function getFormLink(id: string): string {
  return `${getFunctionUrl()}${basePaths.forms}/${id}`;
}
