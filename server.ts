import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API router: Gemini assistance
  app.post("/api/gemini/assist", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ 
          text: "⛰️ Note: The server-side Gemini API Key is not set yet. Here is simulated local guidance:\n\n• **Permit Required**: Yes, National Park entry permits & National Police mountain permits are both required.\n• **Weather Outlook**: Clear mornings with high probability of afternoon mountain convection thunderstorms.\n• **Suggested Equipment**: Waterproof jackets, climbing helmet, thermal underwear, hiking poles, offline map cached in this app, and water filters." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are "AlpineGuide PEAK-100", an elite mountain safety advisor and local guide specializing in the Taiwan 100 Peaks (台灣百岳).
Guidelines:
1. Provide highly practical advice including trail difficulty, water sources, cabin points, weather patterns (afternoon thunderstorms), permits (National Park and Police permits), and safety checkpoints.
2. Formulate your response in a highly structured style with clear bullet points.
3. Be professional, reassuring, and concise. Prevent long paragraphs.
4. If hikers state any emergency (e.g. altitude sickness, injury, path lost), advise the S.T.O.P. principle (Stop, Think, Observe, Plan), finding shelter, maintaining body temperature, and calling 112 (international emergency rescue) or satellite messaging.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error in Gemini API wrapper" });
    }
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully on port ${PORT}`);
  });
}

startServer();
