import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import formRoutes from "./routes/forms.js";
import responseRoutes from "./routes/responses.js";
import webhookRoutes from "./routes/webhooks.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/webhooks", webhookRoutes);

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
}).catch(err => {
  console.error("DB connection failed", err);
});
