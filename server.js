import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- setup ---------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ---------- routes ---------- */

app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: userMessage
    });

    res.json({
      reply: response.output_text || "No response generated."
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({
      reply: "OpenAI error — check server logs."
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
