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
import { toast } from "react-hot-toast";

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

    toast.promise(createFormMutation.mutateAsync(values), {
      loading: "Setting up form...",
      success: <b>Form created</b>,
      error: (err) => {
        return <b>{err.message}</b>;
      },
    });
  };

  return (
    <div>
      <div className="flex items-center p-3">
        <div>Dashboard</div>
        <div className="grid ml-auto">
          <div>
            <BasicButton
              className="bg-red-500 px-1 py-1"
              type="button"
              onClick={handleSignout}
            >
              Logout
            </BasicButton>
          </div>
          <div>{user?.displayName}</div>
        </div>
      </div>
      <div className="p-3">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 grid gap-3"
        >
          Create From
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
      <div>
        <a className="font-medium text-blue-600" href="/app/forms">
          Forms
        </a>
      </div>
      <div>{getFormQuery.isLoading && <div>Loading...</div>}</div>
      <div></div>
    </div>
  );
}
