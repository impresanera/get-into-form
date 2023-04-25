import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { signOut } from "../firebase/firebase";
import { useCurrentUser } from "../firebase/User";
import { useEffect, useMemo, useState } from "react";
import {
  FormDataType,
  getForms,
  getFormData,
  createForms,
  FormType,
} from "../api/forms";
import { BasicButton } from "../components/Buttons";

export function Dashboard() {
  const navigate = useNavigate();
  const [user, userLoading] = useCurrentUser();
  const queryClient = useQueryClient();

  const getFormQuery = useQuery(["forms"], getForms);

  const createFormMutation = useMutation({
    mutationKey: ["createForm"],
    mutationFn: createForms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  const handleSignout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as {
      name: string;
    };

    createFormMutation.mutate(values);
  };

  return (
    <div>
      <div>Dashboard</div>
      <BasicButton type="button" onClick={handleSignout}>
        Logout
      </BasicButton>
      <div>{user?.displayName}</div>
      Create From
      <div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-6">
            <input
              className="shadow appearance-none border rounded w-min py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              required
              inputMode="text"
              placeholder="Form name"
            />
            <BasicButton type="submit" loading={createFormMutation.isLoading}>
              Create Form
            </BasicButton>
          </div>
        </form>
      </div>
      <div>Forms</div>
      <div>{getFormQuery.isLoading && <div>Loading...</div>}</div>
      <div></div>
    </div>
  );
}
