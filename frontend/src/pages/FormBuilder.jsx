import React, { useState, useEffect } from "react";
import API from "../api/api";
import { v4 as uuidv4 } from "uuid";

const createNewQuestion = (index) => ({
  questionKey: `q_${uuidv4()}`,
  label: `Question ${index + 1}`,
  type: "short_text", 
  required: false,
  options: [],
  conditionalRules: null
});

export default function FormBuilder() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [forms, setForms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // load existing forms for the dev user (optional)
    API.get("/forms")
      .then((r) => setForms(r.data || []))
      .catch(() => {
        // ignore errors in initial load
      });
  }, []);

  const addQuestion = () => {
    setQuestions((qs) => [...qs, createNewQuestion(qs.length)]);
  };

  const updateQuestion = (idx, patch) => {
    setQuestions((qs) => {
      const copy = [...qs];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const removeQuestion = (idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const saveForm = async () => {
    if (!title.trim()) return alert("Form title is required");
    if (questions.length === 0) return alert("Add at least one question");

    // Basic client-side validation: ensure select options exist for select types and conditionalRules parse
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if ((q.type === "single_select" || q.type === "multi_select") && (!q.options || q.options.length === 0)) {
        return alert(`Question ${i + 1}: select options required for ${q.type}`);
      }
      // conditionalRules should be either null or an object with logic + conditions
      if (q.conditionalRules && typeof q.conditionalRules === "string") {
        try {
          const parsed = JSON.parse(q.conditionalRules);
          updateQuestion(i, { conditionalRules: parsed });
        } catch (err) {
          return alert(`Question ${i + 1}: conditionalRules JSON invalid`);
        }
      }
    }

    const payload = {
      title,
      airtableBaseId: "", // fill if you want to attach baseId; can be updated later
      airtableTableId: "Table 1",
      questions
    };

    try {
      setSaving(true);
      const res = await API.post("/forms", payload);
      alert("Form saved successfully");
      // Add saved form to list & reset builder
      setForms((f) => [res.data, ...f]);
      setTitle("");
      setQuestions([]);
    } catch (err) {
      console.error(err);
      alert("Save failed: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Form Builder</h2>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Form title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "70%", padding: 8, marginRight: 8 }}
        />
        <button onClick={addQuestion}>Add question</button>
        <button onClick={saveForm} style={{ marginLeft: 8 }} disabled={saving}>
          {saving ? "Saving..." : "Save form"}
        </button>
      </div>

      {questions.length === 0 && (
        <div style={{ marginBottom: 12, color: "#555" }}>
          Add questions using the "Add question" button. For conditional rules use the JSON textarea (see example).
        </div>
      )}

      {questions.map((q, i) => (
        <div key={q.questionKey} style={{ border: "1px solid #e0e0e0", padding: 12, marginBottom: 10, borderRadius: 6 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <strong style={{ width: 120 }}>Question #{i + 1}</strong>
            <input
              value={q.label}
              onChange={(e) => updateQuestion(i, { label: e.target.value })}
              placeholder="Label (shown to respondents)"
              style={{ flex: 1, padding: 6 }}
            />
            <select
              value={q.type}
              onChange={(e) => updateQuestion(i, { type: e.target.value })}
              style={{ marginLeft: 8 }}
            >
              <option value="short_text">Short text</option>
              <option value="long_text">Long text</option>
              <option value="single_select">Single select</option>
              <option value="multi_select">Multi select</option>
              <option value="attachment">Attachment</option>
            </select>
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => updateQuestion(i, { required: e.target.checked })}
              />{" "}
              Required
            </label>
            <button onClick={() => removeQuestion(i)} style={{ marginLeft: 8 }}>
              Remove
            </button>
          </div>

          {(q.type === "single_select" || q.type === "multi_select") && (
            <div style={{ marginTop: 8 }}>
              <small>Options (comma separated):</small>
              <input
                value={Array.isArray(q.options) ? q.options.join(", ") : q.options || ""}
                onChange={(e) =>
                  updateQuestion(i, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
                style={{ width: "100%", padding: 6, marginTop: 6 }}
                placeholder="e.g. Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <small>Conditional rules (optional) — enter JSON for MVP. Example:</small>
            <pre style={{ background: "#fafafa", padding: 8, borderRadius: 4, fontSize: 12 }}>
              {"{ \"logic\": \"AND\", \"conditions\": [{ \"questionKey\": \"q_xxx\", \"operator\": \"equals\", \"value\": \"Yes\" }] }"}
            </pre>
            <textarea
              value={q.conditionalRules ? (typeof q.conditionalRules === "string" ? q.conditionalRules : JSON.stringify(q.conditionalRules)) : ""}
              onChange={(e) => {
                const val = e.target.value;
                // keep as string while typing; parse on save
                updateQuestion(i, { conditionalRules: val });
              }}
              rows={4}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
              placeholder='Paste JSON like: {"logic":"AND","conditions":[{"questionKey":"q_xxx","operator":"equals","value":"Yes"}]}'
            />
          </div>
        </div>
      ))}

      <hr />

      <h3>Your saved forms</h3>
      {forms.length === 0 && <div style={{ color: "#777" }}>No forms yet.</div>}
      <ul>
        {forms.map((f) => (
          <li key={f._id} style={{ marginBottom: 6 }}>
            <a href={`/form/${f._id}`}>{f.title}</a> — <a href={`/responses/${f._id}`}>Responses</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
