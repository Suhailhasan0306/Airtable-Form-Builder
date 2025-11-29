import mongoose from "mongoose";
const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
  airtableRecordId: String,
  answers: Object,
  status: { type: String, default: "active" }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});
export default mongoose.model("Response", ResponseSchema);


