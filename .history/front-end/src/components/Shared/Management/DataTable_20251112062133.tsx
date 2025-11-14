import { useEffect, useRef } from "react";
import { DataTable as SimpleDataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

interface Column {
  heading: string;
  data?: string;
  sortable?: boolean;
  searchable?: boolean;
  type?: "string" | "date" | "number";
  format?: string;
  render?: (data: unknown, row: Record<string, unknown>) => string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  searchable?: boolean;
  sortable?: boolean;
  paging?: boolean;
  perPage?: number;
  perPageSelect?: number[];
  exportable?: boolean;
  className?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function DataTable({
  columns,
  data,
  searchable = true,
  sortable = true,
  paging = true,
  perPage = 10,
  perPageSelect = [5, 10, 20, 50],
  exportable = false,
  className = "",
  onRowClick,
}: DataTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<SimpleDataTable | null>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // Destroy existing instance if any
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
    }

    // Transform data for simple-datatables
    const headings = columns.map((col) => col.heading);
    const tableData: (string | number)[][] = data.map((row) => {
      return columns.map((col) => {
        const value = col.data ? row[col.data] : "";
        if (col.render) {
          return col.render(value, row);
        }
        return String(value || "");
      });
    });

    // Initialize DataTable
    try {
      dataTableRef.current = new SimpleDataTable(tableRef.current, {
        searchable,
        sortable,
        paging,
        perPage,
        perPageSelect,
        data: {
          headings,
          data: tableData,
        },
        labels: {
          placeholder: "Search...",
          perPage: "entries per page",
          noRows: "No entries found",
          info: "Showing {start} to {end} of {rows} entries",
        },
        classes: {
          active: "bg-beige-100",
          disabled: "opacity-50 cursor-not-allowed",
          selector: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500",
          paginationList: "flex gap-2 mt-4",
          paginationListItem: "",
          paginationListItemLink: "px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
          search: "mb-4",
          input: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500",
        },
        template: (options) => {
          const template = `
            <div class='${options.classes.top}'>
              ${exportable
              ? `
                <div class='flex justify-between items-center mb-4'>
                  <div class='${options.classes.search}'></div>
                  <button id='export-csv' class='px-4 py-2 text-white bg-beige-700 rounded-lg hover:bg-beige-800 transition-colors'>
                    Export CSV
                  </button>
                </div>
              `
              : `<div class='${options.classes.search}'></div>`
            }
              <div class='${options.classes.dropdown}'></div>
            </div>
            <div class='${options.classes.container}'>${options.tableRender}</div>
            <div class='${options.classes.bottom}'>
              <div class='${options.classes.info}'></div>
              <nav class='${options.classes.pagination}'></nav>
            </div>
          `;
          return template;
        },
      });

      // Add export functionality if enabled
      if (exportable) {
        setTimeout(() => {
          const exportBtn = document.getElementById("export-csv");
          if (exportBtn && dataTableRef.current) {
            exportBtn.addEventListener("click", () => {
              if (dataTableRef.current) {
                const csv = convertToCSV(headings, tableData);
                downloadCSV(csv, "export.csv");
              }
            });
          }
        }, 100);
      }

      // Add row click handler
      if (onRowClick) {
        tableRef.current.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          const row = target.closest("tr");
          if (row && row.parentElement?.tagName === "TBODY") {
            const rowIndex = Array.from(row.parentElement.children).indexOf(row);
            if (rowIndex >= 0 && data[rowIndex]) {
              onRowClick(data[rowIndex]);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error initializing DataTable:", error);
    }

    // Cleanup
    return () => {
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
        } catch (error) {
          console.error("Error destroying DataTable:", error);
        }
      }
    };
  }, [data, columns, searchable, sortable, paging, perPage, perPageSelect, exportable, onRowClick]);

  return (
    <div className={`datatable-wrapper ${className}`}>
      <table ref={tableRef} className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3">
                {col.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}

// Helper function to convert data to CSV
function convertToCSV(headings: string[], data: (string | number)[][]): string {
  const header = headings.join(",");
  const rows = data.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  );
  return [header, ...rows].join("\n");
}

// Helper function to download CSV
function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
