import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  airtableUserId: String,
  profile: Object,
  accessToken: String,
  refreshToken: String,
  loginAt: Date
});
export default mongoose.model("User", UserSchema);
