import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

/* ---------- setup ---------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
/* ---------- free tier daily limit (cookie-based) ---------- */

const FREE_DAILY_LIMIT = 5;

// In-memory usage store (resets on server restart)
const freeUsage = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getClientId(req, res) {
  // Try to read existing cookie
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/fethink_id=([^;]+)/);
  let id = match ? match[1] : null;

  // If no cookie, create one
  if (!id) {
    id = crypto.randomUUID();
    res.setHeader(
      "Set-Cookie",
      `fethink_id=${id}; Path=/; Max-Age=31536000; SameSite=Lax`
    );
  }

  return id;
}

/* ---------- routes ---------- */

app.post("/ask", async (req, res) => {
  try {
    const { message, tier } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a question." });
    }

    // Enforce FREE tier limit only
    if (tier === "free") {
      const clientId = getClientId(req, res);
      const key = `${todayKey()}::${clientId}`;
      const count = freeUsage.get(key) || 0;

      if (count >= FREE_DAILY_LIMIT) {
        return res.json({
          reply:
            "You’ve reached today’s free limit (5 questions). Please try again tomorrow."
        });
      }

      // Count this request
      freeUsage.set(key, count + 1);
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: message
    });

    res.json({
      reply: response.output_text || "No response generated."
    });

  } catch (error) {
    console.error("FREE LIMIT ERROR:", error);
    res.status(500).json({
      reply: "Temporary error. Please try again shortly."
    });
  }
});


app.get("/widget/research", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "widget-research.html"));
});

/* ---------- start server ---------- */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`FEThink AI running on port ${PORT}`);
});
