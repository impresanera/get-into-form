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
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import {
  FormDataType,
  getForms,
  getFormData,
  createForms,
  FormType,
  deleteForms,
  getFormLink,
  createEmailMailgunAutomation,
} from "../api/forms";
import { BasicButton } from "../components/Buttons";
import { SortButton } from "../components/Buttons/SortButton";
import { toast } from "react-hot-toast";
import {
  CreateMailgunEmailAutomationPayload,
  createMailgunFormAutomation,
} from "shared";
import { BasicInput } from "../components/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function Dashboard() {
  const navigate = useNavigate();
  const [user, userLoading] = useCurrentUser();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormDataType[]>([]);
  const [formInfo, setFormInfo] = useState<FormType>({
    id: "",
    name: "",
  });
  const [showMgEmailForm, setShowMgEmailForm] = useState({
    open: false,
    form: "",
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
        {showMgEmailForm.open && (
          <EmailAutomationForm
            formId={showMgEmailForm.form}
            setAddAutomation={setShowMgEmailForm}
          />
        )}
      </div>
      <div>Forms</div>
      <div>{getFormQuery.isLoading && <div>Loading...</div>}</div>
      <div>
        {getFormQuery.data?.ok && (
          <div>
            <FormList
              forms={getFormQuery.data.value}
              setFormInfo={setFormInfo}
              setAddAutomation={setShowMgEmailForm}
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

function FormList(prop: {
  forms: FormType[];
  setFormInfo?: (form: FormType) => void;
  setAddAutomation?: (showAddAutomationForm: {
    open: boolean;
    form: string;
  }) => void;
}) {
  const formList = useMemo<FormListTableType[]>(() => {
    let formList: FormListTableType[] = [];

    for (let i = 0; i < prop.forms.length; i++) {
      formList.push({
        action: "",
        id: prop.forms[i].id,
        name: prop.forms[i].name,
        link: getFormLink(prop.forms[i].id),
      });
    }
    return formList;
  }, [prop.forms]);

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

                      <button
                        className="font-medium text-blue-600 dark:text-blue-500"
                        onClick={() => {
                          prop.setAddAutomation &&
                            prop.setAddAutomation({
                              open: true,
                              form: cell.row.original.id,
                            });
                        }}
                      >
                        add auto
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

function EmailAutomationForm(prop: {
  formId: string;
  setAddAutomation?: (showAddAutomationForm: {
    open: boolean;
    form: string;
  }) => void;
}) {
  const { handleSubmit, register, formState } =
    useForm<CreateMailgunEmailAutomationPayload>({
      // shouldUseNativeValidation: true,
      shouldFocusError: true,
      resolver: zodResolver(createMailgunFormAutomation),
    });

  const onSubmit: SubmitHandler<CreateMailgunEmailAutomationPayload> = async (
    values
  ) => {
    console.log(values, prop.formId);
    await toast.promise(
      (async () => {
        const res = await createEmailMailgunAutomation(prop.formId, values);
        if (res.ok) {
          return res.value;
        }
        throw res.error;
      })(),
      {
        loading: "Create mail gun automation ...",
        success: <b>Automation created</b>,
        error: (err) => {
          return <b>{err.message}</b>;
        },
      }
    );

    if (prop.setAddAutomation) {
      prop.setAddAutomation({
        open: false,
        form: prop.formId,
      });
    }
  };

  return (
    <div className="w-full grid place-content-center relative my-3">
      <div className="text-center">Create Mailgun Email Automation </div>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 grid gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex gap-6 justify-end">
          <button
            className="font-bold"
            title="close form"
            type="button"
            onClick={() =>
              prop.setAddAutomation &&
              prop.setAddAutomation({
                open: false,
                form: prop.formId,
              })
            }
          >
            x
          </button>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="autonametionName"
            >
              Name
            </label>
            <BasicInput
              type="text"
              id="autonametionName"
              {...register("name", {
                required: true,
              })}
              placeholder="name"
              errorMessage={formState.errors.name?.message}
            />
          </div>
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="emailSubject"
            >
              Email title
            </label>
            <BasicInput
              id="emailSubject"
              type="text"
              {...register("emailSubject", {
                required: true,
              })}
              placeholder="email title"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="provider"
            >
              Provider
            </label>
            <BasicInput
              type="text"
              id="provider"
              {...register("provider", {
                required: true,
              })}
              value={"MAILGUN"}
              readOnly
            />
          </div>
          <div className="grid w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="type"
            >
              Domain region
            </label>
            <div className="mb-4 w-full flex gap-3 items-center  p-3 border border-gray-200 rounded ">
              <input
                type="checkbox"
                id="isEu"
                {...register("isEu")}
                placeholder="EU region"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
              />
              <label
                htmlFor="isEu"
                className="w-full ml-2 text-sm font-medium text-gray-900 "
              >
                EU region
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="apiKey"
            >
              Api key
            </label>
            <BasicInput
              type="password"
              {...register("apiKey", {
                required: true,
              })}
              id="apiKey"
              placeholder="api key"
            />
          </div>
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="domain"
            >
              Domain
            </label>
            <BasicInput
              type="text"
              {...register("domain", {
                required: true,
              })}
              id="domain"
              placeholder="domain"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sender"
            >
              Sender
            </label>
            <BasicInput
              type="text"
              {...register("sender", {
                required: true,
              })}
              id="sender"
              placeholder="sender"
              errorMessage={formState.errors.sender?.message}
            />
          </div>
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="replyTo"
            >
              Reply to
            </label>

            <BasicInput
              type="email"
              {...register("replyTo", {
                required: true,
              })}
              id="replyTo"
              placeholder="reply to"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="emailSourceType"
            >
              Email Source Type
            </label>

            <BasicInput
              id="emailSourceType"
              type="text"
              {...register("emailSourceType", {
                required: true,
              })}
              defaultValue={"TEMPLATE"}
              readOnly
            />
          </div>
          <div className="mb-4 w-6/12">
            <label
              htmlFor="emailSourceValue"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email source value
            </label>
            <textarea
              id="emailSourceValue"
              {...register("emailSourceValue", {
                required: true,
              })}
              // rows={4}
              placeholder="template name or email content"
              className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="receiverSource"
            >
              Receiver Type
            </label>
            <select
              {...register("receiverSource")}
              defaultValue={"FORM_DATA"}
              id="receiverSource"
              placeholder="receiverSource"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="FORM_DATA">FORM DATA</option>
              <option value="FIXED">FIXED</option>
            </select>
          </div>

          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="receiverValue"
            >
              Receiver
            </label>

            <BasicInput
              type="text"
              {...register("receiverValue", {
                required: true,
              })}
              id="receiverValue"
              placeholder="receiver value"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="type"
            >
              Automation type
            </label>

            <BasicInput
              {...register("type", {
                required: true,
              })}
              defaultValue="EMAIL"
              type="text"
              placeholder="automation type"
              id="type"
              readOnly
            />
          </div>

          <div className="mb-4 w-6/12">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="trigger"
            >
              Trigger
            </label>
            <select
              {...register("trigger", {
                required: true,
              })}
              id="trigger"
              placeholder="trigger"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              multiple
              defaultValue={["ON_DATA_ADDED"]}
            >
              <option className="p-3" value="ON_DATA_ADDED">
                ON DATA ADDED
              </option>
              <option className="p-3" value="ON_DATA_ADDED">
                ON DATA ADDED
              </option>
            </select>
          </div>
        </div>

        <BasicButton type="submit">Submit</BasicButton>
      </form>
    </div>
  );
}
