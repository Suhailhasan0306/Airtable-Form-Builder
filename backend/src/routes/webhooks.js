import express from "express";
import ResponseModel from "../models/Response.js";
const router = express.Router();


router.post("/airtable", async (req,res) => {
  try {
    const body = req.body;
    const type = body.type;
    const recId = body.recordId || body.record?.id || (body.records && body.records[0] && body.records[0].id);

    if (!type || !recId) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    if (type === "record.updated") {
      const fields = body.fields || (body.record && body.record.fields) || {};
      const r = await ResponseModel.findOne({ airtableRecordId: recId });
      if (r) {
        r.answers = fields;
        r.updatedAt = new Date();
        await r.save();
      } else {
        // optionally create a response record if needed
      }
    } else if (type === "record.deleted") {
      const r = await ResponseModel.findOne({ airtableRecordId: recId });
      if (r) {
        r.status = "deletedInAirtable";
        r.updatedAt = new Date();
        await r.save();
      }
    } else if (type === "record.created") {
      // optionally create mapping in DB
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
