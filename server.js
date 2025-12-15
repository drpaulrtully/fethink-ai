import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(express.static("public"));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

  const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are the FEThink AI assistant." },
    { role: "user", content: userMessage }
  ]
});

// SAFELY extract text
const reply =
  completion &&
  completion.choices &&
  completion.choices[0] &&
  completion.choices[0].message &&
  completion.choices[0].message.content
    ? completion.choices[0].message.content
    : "Sorry — I couldn’t generate a response.";

res.json({ reply });


  } catch (error) {
    res.status(500).json({ error: "AI request failed" });
  }
});
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/widget/research", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "widget-research.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FEThink AI running on port ${PORT}`);
});
