import type { GeoDataPoint } from "../_types";

export function exportToCSV(
  data: GeoDataPoint[],
  filename: string,
  compare = false,
) {
  if (!data.length) return;

  const headers =
    compare ?
      ["التاريخ", "القيمة الحالية", "القيمة السابقة"]
    : ["التاريخ", "القيمة"];

  const rows = data.map((d) =>
    compare ?
      [(d as any).date, (d as any).value, (d as any).previousValue].join(",")
    : [(d as any).date, (d as any).value].join(","),
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
