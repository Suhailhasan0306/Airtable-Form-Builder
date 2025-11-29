import fetch from "node-fetch";
const API_BASE = "https://api.airtable.com/v0";

export async function fetchSampleRecord(baseId, tableName, accessToken) {
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }});
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Airtable fetch failed: ${res.status} ${txt}`);
  }
  return await res.json();
}

export async function createAirtableRecord(baseId, tableName, accessToken, fieldsObj) {
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}`;
  const body = { fields: fieldsObj };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}
