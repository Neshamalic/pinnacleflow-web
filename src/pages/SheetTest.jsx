import { useEffect, useState } from "react";
import { fetchGoogleSheet } from "../lib/googleSheet";
import { SHEET_ID } from "../lib/sheetsConfig";

export default function SheetTest() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "products_master" })
      .then((r) => setRows(r))
      .catch((e) => setError(e?.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Sheet Test</h1>
      <p>Rows: {rows.length}</p>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
        {JSON.stringify(rows.slice(0, 5), null, 2)}
      </pre>
    </div>
  );
}
