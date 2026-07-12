import * as XLSX from "xlsx";

export function exportToExcel(rows, filename = "GoldMind-Report.xlsx") {
  const cleanRows = rows.map(({ rowIndex, ...rest }) => rest);
  const ws = XLSX.utils.json_to_sheet(cleanRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reports");
  XLSX.writeFile(wb, filename);
}
