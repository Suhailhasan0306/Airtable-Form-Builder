import express from "express";
import Form from "../models/Form.js";
const router = express.Router();

async function requireUser(req, res, next) {
  const uid = req.header("x-user-id");
  if (!uid) return res.status(401).json({ error: "Missing x-user-id (dev only)" });
  req.userId = uid;
  next();
}
router.use(requireUser);

// Create form
router.post("/", async (req, res) => {
  try {
    const { title, airtableBaseId, airtableTableId, questions } = req.body;
    // Basic validation: ensure question types allowed
    const allowed = ["short_text","long_text","single_select","multi_select","attachment"];
    for (const q of questions || []) {
      if (!allowed.includes(q.type)) return res.status(400).json({ error: `Unsupported field type ${q.type}`});
    }
    const form = new Form({ ownerId: req.userId, title, airtableBaseId, airtableTableId, questions });
    await form.save();
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single form
router.get("/:id", async (req, res) => {
  const f = await Form.findById(req.params.id);
  if (!f) return res.status(404).json({ error: "Form not found" });
  res.json(f);
});

// List forms for owner
router.get("/", async (req, res) => {
  const list = await Form.find({ ownerId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

export default router;
