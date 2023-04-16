import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useNavigation } from "react-router-dom";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  HeaderGroup,
} from "@tanstack/react-table";
import { signOut } from "../firebase/firebase";
import { useCurrentUser } from "../firebase/User";
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import {
  FormDataType,
  getForms,
  getFormData,
  createForms,
  FormType,
  deleteForms,
  getFormLink,
} from "../api/forms";
import { BasicButton } from "../components/Buttons";
import { SortButton } from "../components/Buttons/SortButton";
import { toast } from "react-hot-toast";

export function Dashboard() {
  const navigate = useNavigate();
  const [user, userLoading] = useCurrentUser();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormDataType[]>([]);
  const [formInfo, setFormInfo] = useState<FormType>({
    id: "",
    name: "",
  });

  const getFormQuery = useQuery(["forms"], getForms);

  const getFormDataQuery = useQuery({
    queryKey: ["form-data", formInfo],
    queryFn: () => getFormData(formInfo.id || ""),
    onSuccess: (data) => {
      if (data.ok) {
        setFormData(data.value);
      }
    },
  });

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

  useEffect(() => {
    if (!user && !userLoading) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["form-data", formInfo] });
  }, [formInfo]);

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
          <div className="flex gap-3">
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
      <div>
        {getFormQuery.data?.ok && (
          <div>
            <FormList
              forms={getFormQuery.data.value}
              setFormInfo={setFormInfo}
            />
          </div>
        )}
        <hr />
        <div>
          {formData.length ? (
            <FormDataList
              name={formInfo.name}
              formData={formData}
              loading={getFormDataQuery.isLoading}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

type FormListTableType = {
  action: string;
  link: string;
} & FormType;

const formColHelper = createColumnHelper<FormListTableType>();
// const col = ;
function FormList(prop: {
  forms: FormType[];
  setFormInfo?: (form: FormType) => void;
}) {
  const formList = useMemo<FormListTableType[]>(() => {
    let formList: FormListTableType[] = [];

    const forms = prop.forms;

    for (let i = 0; i < prop.forms.length; i++) {
      formList.push({
        action: "",
        id: forms[i].id,
        name: forms[i].name,
        link: getFormLink(forms[i].id),
      });
    }

    return formList;
  }, []);
  const table = useReactTable<FormListTableType>({
    columns: [
      formColHelper.accessor("name", {}),
      formColHelper.accessor("link", {
        cell: (val) => {
          return (
            <CopyTiClipBoardBox text={val.getValue()}>
              &lt; &gt;
            </CopyTiClipBoardBox>
          );
        },
      }),
      formColHelper.accessor("action", {}),
    ],
    getCoreRowModel: getCoreRowModel(),
    data: formList,
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
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
          Forms
          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400 place-content-center"></p>
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          {...table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if (
                  header.column.id === "action" ||
                  header.column.id === "link"
                ) {
                  return (
                    <th key={header.id} scope="col" className="px-6 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                }

                return (
                  <th key={header.id} scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <SortButton />
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((rowGroup) => (
            <tr
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              key={rowGroup.id}
            >
              {rowGroup.getVisibleCells().map((cell) => {
                if (cell.column.id === "action") {
                  return (
                    <td
                      scope="row"
                      className="px-6 py-4 flex gap-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      key={cell.id}
                    >
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500"
                        onClick={() => {
                          prop.setFormInfo &&
                            prop.setFormInfo(rowGroup.original);
                        }}
                      >
                        view
                      </button>

                      <button
                        className="font-medium text-blue-600 dark:text-blue-500"
                        onClick={() =>
                          deleteFormMutation.mutate(cell.row.original.id)
                        }
                      >
                        Remove
                      </button>
                    </td>
                  );
                }

                return (
                  <td
                    key={cell.id}
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const formDataColHelper = createColumnHelper<FormDataType>();

function FormDataList(prop: {
  formData: FormDataType[];
  loading?: boolean;
  name: string;
}) {
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
        header: "created at",
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    data: prop.formData,
  });

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      {prop.loading && <>Loading</>}
      {!prop.loading && prop.formData && (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
          {prop.name && (
            <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
              {prop.name} - Form data
              <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400 place-content-center"></p>
            </caption>
          )}
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3">
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
              <tr
                key={rowGroup.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                {rowGroup.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
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

function CopyTiClipBoardBox({
  children,
  ...prop
}: PropsWithChildren<{ text: string }>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, Number.MAX_SAFE_INTEGER);
    navigator.clipboard.writeText(inputRef.current.value);

    toast("Link copied");
  };

  return (
    <>
      <button onClick={() => copy()} {...prop}>
        {children}
      </button>
      <input type="text" ref={inputRef} hidden defaultValue={prop.text} />
    </>
  );
}
