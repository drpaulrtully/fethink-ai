import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());
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

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: "AI request failed" });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FEThink AI running on port ${PORT}`);
});
