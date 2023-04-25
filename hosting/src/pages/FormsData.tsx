import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FormDataType, getFormData } from "../api/forms";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdOutlineFileDownload } from "react-icons/md";
import exportFromJSON, { ExportType } from "export-from-json";

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
      // formDataColHelper.accessor("id", {}),
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
        header: (elt) => {
          console.log();
          if (elt.table.getRowModel().rows.length) {
            return "created at";
          }

          return null;
        },
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    data: prop.formData,
  });

  const handleFormDataDownload = (format: Exclude<ExportType, "css">) => {
    const data = prop.formData.map((elt) => {
      return {
        ...elt,
        createdAt: new Date(
          (
            elt.createdAt as {
              _seconds: number;
              _nanoseconds: number;
            }
          )._seconds * 1000
        ).toDateString(),
      };
    });
    const fileName = prop.name || "form-data";

    exportFromJSON({ data, fileName, exportType: format });
  };

  const exportTypes = Object.keys(exportFromJSON.types).filter(
    (el) => el !== "css"
  ) as Exclude<ExportType, "css">[];

  return (
    <div className="grid gap-3">
      {prop.formData.length ? (
        <DropDownAction options={exportTypes} action={handleFormDataDownload} />
      ) : null}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        {prop.loading && <>Loading</>}
        {!prop.loading && prop.formData && (
          <div>
            <table className="w-full text-sm text-left text-gray-500 table-auto">
              {prop.name && (
                <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white ">
                  {prop.name} - Form data
                  <p className="mt-1 text-sm font-normal text-gray-500 place-content-center"></p>
                </caption>
              )}
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((rowGroup) => (
                    <tr key={rowGroup.id} className="bg-white border-b">
                      {rowGroup.getVisibleCells().map((cell) => (
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
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="bg-white border-b">
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-center"
                      >
                        No new data
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function FormDataPage() {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const navigate = useNavigate();
  if (!id) {
    navigate("/app/forms");
  }
  const [formData, setFormData] = useState<FormDataType[]>([]);
  const formName = query.get("name") || "";

  const getFormDataQuery = useQuery({
    queryKey: ["form-data", { id, formName }],
    queryFn: () => getFormData(id || ""),
    onSuccess: (data) => {
      if (data.ok) {
        setFormData(data.value);
      }
    },
  });
  return (
    <div className="p-3">
      {
        <FormDataList
          name={formName}
          formData={formData}
          loading={getFormDataQuery.isLoading}
        />
      }
    </div>
  );
}

function DropDownAction<T extends string>(prop: {
  action: (value: T) => void;
  options: T[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<T | null>(null);

  const dowloadIsDisables = useMemo(
    () => !Boolean(selectedValue),
    [selectedValue]
  );

  const lists = useMemo(() => {
    return prop.options.map((el, idx) => {
      return (
        <li key={idx} className="block hover:bg-gray-100">
          <button
            className="w-full h-full px-4 py-2"
            onClick={() => {
              setSelectedValue(el);
              console.log({ el });
              setIsOpen((prev) => !prev);
            }}
          >
            {el.toUpperCase()}
          </button>
        </li>
      );
    });
  }, [prop.options]);

  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium border-r-2 border-gray-300 rounded-bl-lg rounded-tl-lg text-sm px-4 py-2.5 text-center inline-flex items-center "
          type="button"
        >
          {selectedValue?.toUpperCase() || "Format"}
        </button>
        <button
          onClick={() => {
            if (selectedValue) {
              prop.action(selectedValue);
            }
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-br-lg rounded-tr-lg text-sm px-4 py-2.5 text-center inline-flex items-center disabled:bg-blue-200"
          type="button"
          disabled={dowloadIsDisables}
        >
          <MdOutlineFileDownload className="text-xl font-bold" />
        </button>
      </div>

      {isOpen && (
        <div
          id="dropdown"
          className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 absolute"
        >
          <ul
            onBlur={() => setIsOpen((prev) => !prev)}
            className="py-2 text-sm text-gray-700 "
            aria-labelledby="dropdownDefaultButton"
          >
            {lists}
          </ul>
        </div>
      )}
    </div>
  );
}
