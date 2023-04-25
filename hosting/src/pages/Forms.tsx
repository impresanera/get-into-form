import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  FormType,
  getFormLink,
  deleteForms,
  getForms,
  createEmailMailgunAutomation,
} from "../api/forms";
import { SortButton } from "../components/Buttons/SortButton";
import { CopyTiClipBoardBox } from "../components/CopyToClipBoard";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import {
  CreateMailgunEmailAutomationPayload,
  createMailgunFormAutomation,
} from "shared";
import { BasicButton } from "../components/Buttons";
import { BasicInput } from "../components/Input";
import { IoMdLink, IoMdEye, IoMdRemoveCircle } from "react-icons/io";

import { MdCloudSync } from "react-icons/md";

type FormListTableType = {
  action: string;
  link: string;
} & FormType;

const formColHelper = createColumnHelper<FormListTableType>();

export function FormList(prop: {
  forms: FormType[];
  setAddAutomation?: (showAddAutomationForm: {
    open: boolean;
    form: string;
  }) => void;
}) {
  const navigate = useNavigate();
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
            <CopyTiClipBoardBox
              text={val.getValue()}
              onClick={() => toast.success("Link copied")}
            >
              <IoMdLink className="text-xl font-bold" />
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
      <table className="w-full text-sm text-left text-gray-500  table-auto">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Forms
          <p className="mt-1 text-sm font-normal text-gray-500  place-content-center"></p>
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((rowGroup) => (
              <tr className="bg-white border-b" key={rowGroup.id}>
                {rowGroup.getVisibleCells().map((cell) => {
                  if (cell.column.id === "action") {
                    return (
                      <td
                        scope="row"
                        className="px-6 py-4 flex gap-3 font-medium text-gray-900 whitespace-nowrap"
                        key={cell.id}
                      >
                        <button
                          className="font-medium text-blue-600"
                          onClick={() => {
                            navigate(
                              `/app/forms/${rowGroup.original.id}?name=${rowGroup.original.name}`
                            );
                          }}
                          title="View data"
                        >
                          <IoMdEye className="text-xl font-bold" />
                        </button>

                        <button
                          onClick={() =>
                            deleteFormMutation.mutate(cell.row.original.id)
                          }
                          title="Remove item"
                        >
                          <IoMdRemoveCircle className="text-xl font-bold text-blue-600" />
                        </button>

                        <button
                          className="text-xl font-bold text-blue-600"
                          onClick={() => {
                            prop.setAddAutomation &&
                              prop.setAddAutomation({
                                open: true,
                                form: cell.row.original.id,
                              });
                          }}
                          title="Add automation"
                        >
                          <MdCloudSync className="text-xl font-bold text-blue-600" />
                        </button>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={cell.id}
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr className="bg-white border-b">
              <td
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-center"
                colSpan={table.getFlatHeaders().length}
              >
                No forms
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
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
      shouldFocusError: true,
      resolver: zodResolver(createMailgunFormAutomation),
    });

  const onSubmit: SubmitHandler<CreateMailgunEmailAutomationPayload> = async (
    values
  ) => {
    await toast.promise(
      (async () => {
        const res = await createEmailMailgunAutomation(prop.formId, values);
        if (res.ok) {
          return res.value;
        }
        throw res.error;
      })(),
      {
        loading: "Creating mailgun automation...",
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

export function FormPage() {
  const getFormQuery = useQuery(["forms"], getForms);
  const [showMgEmailForm, setShowMgEmailForm] = useState({
    open: false,
    form: "",
  });

  return (
    <div className="p-3">
      <div>
        {showMgEmailForm.open && (
          <EmailAutomationForm
            formId={showMgEmailForm.form}
            setAddAutomation={setShowMgEmailForm}
          />
        )}
      </div>

      <div>
        {getFormQuery.data?.ok && (
          <div>
            <FormList
              forms={getFormQuery.data.value}
              setAddAutomation={setShowMgEmailForm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
