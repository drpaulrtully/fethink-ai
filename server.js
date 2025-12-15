import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

const app = express();
app.use(express.json());
app.use(express.static("public"));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: userMessage
    });

    res.json({ reply: response.output_text });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({ reply: "OpenAI error — check logs." });
  }
});

app.get("/widget/research", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "widget-research.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FEThink AI running on port ${PORT}`);
});
