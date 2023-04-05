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
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

export async function getFormData(
  formId: string
): Promise<Result<FormDataType[]>> {
  if (formId === "") {
    return { ok: [] };
  }

  try {
    const res = await axios.get<FormDataType[]>(
      `${getFunctionUrl()}${basePaths.forms}/${formId}/form-data`
    );
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

export async function deleteForms(id: string): Promise<Result<FormType[]>> {
  try {
    const res = await axios.delete<FormType[]>(
      `${getFunctionUrl()}${basePaths.forms}/${id}`
    );
    return { ok: res.data };
  } catch (error) {
    return { error };
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
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

export const getFirstUser = async (): Promise<Result<boolean>> => {
  try {
    const res = await axios.get(getFunctionUrl() + basePaths.firstUser);
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
};
