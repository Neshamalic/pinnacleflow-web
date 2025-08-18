export async function fetchGoogleSheet({ sheetId, sheetName, range }) {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`;
  const params = new URLSearchParams({ tqx: "out:json", sheet: sheetName });
  if (range) params.set("range", range);

  const res = await fetch(`${base}?${params.toString()}`);
  const text = await res.text();

  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const cols = json.table.cols.map((c) => c.label || c.id);
  const rows = json.table.rows.map((r) =>
    Object.fromEntries(cols.map((c, i) => [c, r.c?.[i]?.v ?? null]))
  );
  return rows;
}
