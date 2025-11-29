import mongoose from "mongoose";
const QuestionSchema = new mongoose.Schema({
  questionKey: { type: String, required: true },
  airtableFieldId: String,
  label: String,
  type: { type: String, required: true }, 
  required: { type: Boolean, default: false },
  options: [String],
  conditionalRules: { type: Object, default: null }
});

const FormSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  airtableBaseId: String,
  airtableTableId: String,
  title: String,
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Form", FormSchema);
