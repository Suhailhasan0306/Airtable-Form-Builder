import express from "express";
import fetch from "node-fetch";
import User from "../models/User.js";
const router = express.Router();

// Simple dev helper: allow creating a dev user by POST with accessToken
router.post("/dev-create", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: "accessToken required" });
  // try to fetch user profile via /meta/me or fallback
  let profile = {};
  try {
    const p = await fetch("https://api.airtable.com/v0/meta/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    profile = await p.json();
  } catch (err) {
    profile = { id: "dev_user" };
  }
  let user = await User.findOne({ airtableUserId: profile?.id });
  if (!user) user = new User();
  user.airtableUserId = profile?.id ?? `dev-${Date.now()}`;
  user.profile = profile;
  user.accessToken = accessToken;
  user.loginAt = new Date();
  await user.save();
  res.json({ ok: true, userId: user._id });
});

export default router;
