import express from "express";
import Form from "../models/Form.js";
import ResponseModel from "../models/Response.js";
import User from "../models/User.js";
import { createAirtableRecord } from "../services/airtable.js";

const router = express.Router();

async function requireUser(req,res,next){
  const uid = req.header("x-user-id");
  if (!uid) return res.status(401).json({ error: "Missing x-user-id (dev)" });
  req.userId = uid;
  next();
}
router.use(requireUser);

// Submit response -> validate, send to Airtable, save in DB
router.post("/:formId/submit", async (req,res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: "Form not found" });
    const answers = req.body.answers || {};

    // Basic validation: check required fields (we assume frontend enforces visibility)
    for (const q of form.questions) {
      // If conditionalRules exist, we can't reliably evaluate without answers from client; assume client sent only visible answers
      if (q.required && (answers[q.questionKey] === undefined || answers[q.questionKey] === "")) {
        return res.status(400).json({ error: `Field ${q.label || q.questionKey} required` });
      }
      // options validation
      if (q.type === "single_select" && answers[q.questionKey]) {
        if (!q.options.includes(answers[q.questionKey])) return res.status(400).json({ error: `Invalid option for ${q.questionKey}` });
      }
      if (q.type === "multi_select" && answers[q.questionKey]) {
        if (!Array.isArray(answers[q.questionKey])) return res.status(400).json({ error: `Invalid multi-select payload` });
        const invalid = answers[q.questionKey].some(v => !q.options.includes(v));
        if (invalid) return res.status(400).json({ error: `Invalid options in multi-select for ${q.questionKey}`});
      }
    }

    // Map answers to fields for Airtable: use question.label as column name (or questionKey)
    const recordFields = {};
    for (const q of form.questions) {
      if (answers[q.questionKey] !== undefined) {
        // Attachments: Airtable expects array of {url: "..."}
        if (q.type === "attachment") {
          // assume client already sent an array of public URLs or base64 — for MVP accept URLs array
          const v = answers[q.questionKey];
          if (Array.isArray(v)) {
            recordFields[q.label || q.questionKey] = v.map(url => ({ url }));
          } else if (typeof v === "string") {
            recordFields[q.label || q.questionKey] = [{ url: v }];
          }
        } else {
          recordFields[q.label || q.questionKey] = answers[q.questionKey];
        }
      }
    }

    // get owner token
    const owner = await User.findById(form.ownerId);
    if (!owner || !owner.accessToken) return res.status(400).json({ error: "Form owner missing accessToken (configure dev user)" });

    const airtRes = await createAirtableRecord(form.airtableBaseId, form.airtableTableId, owner.accessToken, recordFields);

    const resp = new ResponseModel({
      formId: form._id,
      airtableRecordId: airtRes.id || null,
      answers
    });
    await resp.save();

    res.json({ ok: true, response: resp, airtable: airtRes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List responses
router.get("/:formId", async (req,res) => {
  const list = await ResponseModel.find({ formId: req.params.formId }).sort({ createdAt: -1 });
  res.json(list);
});

export default router;
