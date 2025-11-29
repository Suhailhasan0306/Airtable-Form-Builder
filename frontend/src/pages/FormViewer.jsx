import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { shouldShowQuestion } from "../utils/conditionalLogicClient";

export default function FormViewer() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    if (!formId) return;
    API.get(`/forms/${formId}`).then(r=> {
      setForm(r.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [formId]);

  const onChange = (key, value) => setAnswers(a => ({ ...a, [key]: value }));

  const submit = async () => {
    try {
      const r = await API.post(`/responses/${formId}/submit`, { answers });
      alert("Submitted OK");
      console.log(r.data);
    } catch (err) {
      alert("Submit failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div>
      <h2>{form.title}</h2>
      <form onSubmit={(e)=> { e.preventDefault(); submit(); }}>
        {form.questions.map(q => {
          const visible = shouldShowQuestion(q.conditionalRules, answers);
          if (!visible) return null;
          const key = q.questionKey;
          return (
            <div key={key} style={{marginBottom:12}}>
              <label><strong>{q.label}{q.required ? " *" : ""}</strong></label><br/>
              {q.type === "short_text" && <input value={answers[key]||""} onChange={e=> onChange(key, e.target.value)} />}
              {q.type === "long_text" && <textarea value={answers[key]||""} onChange={e=> onChange(key, e.target.value)} />}
              {q.type === "single_select" && <select value={answers[key]||""} onChange={e=> onChange(key, e.target.value)}>
                <option value="">-- choose --</option>
                { (q.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
              </select>}
              {q.type === "multi_select" && <select multiple value={answers[key]||[]} onChange={e=> {
                const opts = Array.from(e.target.selectedOptions).map(o=> o.value);
                onChange(key, opts);
              }}>
                { (q.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
              </select>}
              {q.type === "attachment" && <input type="file" onChange={async (e)=> {
                const file = e.target.files[0];
                if (!file) return;
                // For MVP convert to base64 and send to backend. Production: upload to S3 and send public URL.
                const reader = new FileReader();
                reader.onload = ()=> {
                  // store base64 string
                  onChange(key, reader.result);
                };
                reader.readAsDataURL(file);
              }} />}
            </div>
          );
        })}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
