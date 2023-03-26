import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Result } from "..";
import { getFunctionUrl, signOut } from "../firebase/firebase";
import { useCurrentUser } from "../firebase/User";
import { useEffect, useMemo, useState } from "react";

export function Dashboard() {
  const navigate = useNavigate();
  const [user] = useCurrentUser();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormDataType[]>([]);
  const [formDataId, setFormDataId] = useState<string>("");

  const getFormQuery = useQuery({ queryKey: ["forms"], queryFn: getForms });

  const getFormDataQuery = useQuery({
    queryKey: ["form-data", formDataId],
    queryFn: () => getFormData(formDataId),
    onSuccess: (data) => {
      if (data.ok) {
        setFormData(data.ok);
      }
    },
  });

  const createFromMutation = useMutation({
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
    await createFromMutation.mutateAsync(values);
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["form-data", formDataId] });
  }, [formDataId]);

  return (
    <div>
      <div>Dashboard</div>
      <button onClick={handleSignout}>Logout</button>
      <div>{user?.displayName}</div>
      Create From
      <div>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" />
          <button type="submit" disabled={createFromMutation.isLoading}>
            Create Form
          </button>
        </form>
      </div>
      <div>Forms</div>
      <div>{getFormQuery.isLoading && <div>Loading...</div>}</div>
      <div>
        {getFormQuery.data?.ok && (
          <div>
            <FormList forms={getFormQuery.data.ok} setFormId={setFormDataId} />
          </div>
        )}

        <div>
          <FormDataList
            formData={formData}
            loading={getFormDataQuery.isLoading}
          />
        </div>
      </div>
    </div>
  );
}

type FormType = { name: string; id: string };
type CreateFormType = { name: string };

async function getForms(): Promise<Result<FormType[]>> {
  try {
    const res = await axios.get<FormType[]>(getFunctionUrl() + "/forms");
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

async function getFormData(formId: string): Promise<Result<FormDataType[]>> {
  if (formId === "") {
    return { ok: [] };
  }

  try {
    const res = await axios.get<FormDataType[]>(
      `${getFunctionUrl()}/forms/${formId}/form-data`
    );
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

async function deleteForms(id: string): Promise<Result<FormType[]>> {
  try {
    const res = await axios.delete<FormType[]>(
      `${getFunctionUrl()}/forms/${id}`
    );
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

async function createForms(
  createFormData: CreateFormType
): Promise<Result<FormType>> {
  try {
    const res = await axios.post<FormType>(
      getFunctionUrl() + "/forms",
      createFormData
    );
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
}

const formColHelper = createColumnHelper<FormType>();
// const col = ;
function FormList(prop: {
  forms: FormType[];
  setFormId?: (id: string) => void;
}) {
  const table = useReactTable({
    columns: [
      formColHelper.accessor("id", {}),
      formColHelper.accessor("name", {}),
    ],
    getCoreRowModel: getCoreRowModel(),
    data: prop.forms,
  });

  const queryClient = useQueryClient();

  const deleteFormMutation = useMutation({
    mutationKey: ["deleteForm"],
    mutationFn: deleteForms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  // const deleteFormMutation = useMutation({
  //   mutationKey: ["deleteForm"],
  //   mutationFn: deleteForms,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["forms"] });
  //   },
  // });

  // const getFormDataQuery = useQuery({
  //   queryFn: getFormData,
  //   queryKey: ["getFormData"],
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["forms"] });
  //   },
  // });

  // getFormData;

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((rowGroup) => (
            <tr key={rowGroup.id}>
              {rowGroup.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}

              <td>
                <button
                  onClick={() => {
                    prop.setFormId && prop.setFormId(rowGroup.original.id);
                  }}
                >
                  view
                </button>
              </td>
              <td>
                <button
                  onClick={() =>
                    deleteFormMutation.mutate(rowGroup.original.id)
                  }
                >
                  {" "}
                  -{" "}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type FormDataType = {
  id: string;
  [key: string]: unknown;
};
const formDataColHelper = createColumnHelper<FormDataType>();

function FormDataList(prop: { formData: FormDataType[]; loading?: boolean }) {
  const cols = useMemo(() => {
    return Array.from(
      new Set(prop.formData.map((elt) => Object.keys(elt)).flat())
    )
      .filter((e) => e !== "id" && e !== "createdAt")
      .sort();
  }, [prop]);

  const table = useReactTable({
    columns: [
      formDataColHelper.accessor("id", {}),
      ...cols.map((elt) => {
        return formDataColHelper.accessor(elt, {});
      }),

      formDataColHelper.accessor("createdAt", {
        cell: (elt) => {
          return new Date(
            (
              elt.row.original.createdAt as {
                _seconds: number;
                _nanoseconds: number;
              }
            )._seconds * 1000
          ).toDateString();
        },
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    data: prop.formData,
  });

  console.log(prop.loading, "loading");

  return (
    <div>
      {prop.loading && <>Loading</>}
      {!prop.loading && prop.formData && (
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((rowGroup) => (
              <tr key={rowGroup.id}>
                {rowGroup.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
