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
            {table.getRowModel().rows.map((rowGroup) => (
              <tr key={rowGroup.id} className="bg-white border-b">
                {rowGroup.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
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
      {formData.length ? (
        <FormDataList
          name={formName}
          formData={formData}
          loading={getFormDataQuery.isLoading}
        />
      ) : null}
    </div>
  );
}
