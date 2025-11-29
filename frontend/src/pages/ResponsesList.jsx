import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function ResponsesList(){
  const { formId } = useParams();
  const [list, setList] = useState([]);

  useEffect(()=> {
    if (!formId) return;
    API.get(`/responses/${formId}`).then(r => setList(r.data)).catch(()=>{});
  }, [formId]);

  return (
    <div>
      <h2>Responses</h2>
      <div>
        {list.map(r => (
          <div key={r._id} style={{border:"1px solid #ddd", padding:8, marginBottom:8}}>
            <div><strong>At:</strong> {new Date(r.createdAt).toLocaleString()}</div>
            <div><strong>Status:</strong> {r.status}</div>
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(r.answers, null, 2)}</pre>
            <div><strong>Airtable ID:</strong> {r.airtableRecordId}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
