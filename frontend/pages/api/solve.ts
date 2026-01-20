import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { problem, language = "Python" } = req.body || {};
    if (!problem) return res.status(400).json({ error: "No problem provided." });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        solutions: {
          type: SchemaType.ARRAY,
          minItems: 4,
          maxItems: 4,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              approachType: { type: SchemaType.STRING },
              snippet: { type: SchemaType.STRING },
              theory: { type: SchemaType.STRING },
              complexity: { type: SchemaType.STRING },
              lineExplanations: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "Line-for-line explanation for hover feature",
              },
              audioText: { type: SchemaType.STRING },
            },
            required: ["title", "approachType", "snippet", "theory", "complexity", "lineExplanations", "audioText"],
          },
        },
      },
      required: ["solutions"],
    };

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
You are a senior Data Structures & Algorithms instructor and technical interviewer.

Solve the problem: "${problem}" using ${language}.

STRICT RULES:
1. Provide EXACTLY 4 approaches in this order: Brute Force, Time-Optimized, Space-Optimized, Ideal.
2. snippet: Clean, executable ${language} code, no extra comments.
3. lineExplanations: Provide an array of strings, one explanation for each line of code in the snippet. Each explanation should be beginner-friendly, clear, and correspond exactly to the line at the same index in the snippet. Do NOT skip lines.
4. theory:
   - Must be structured in numbered steps (Step 1, Step 2, ...)
   - Each step on a new line.
   - Include reasoning behind each step.
   - Include small examples or illustrations to clarify concepts.
   - Compare briefly to the previous approach where relevant.
   - Do NOT merge all steps into a single paragraph.
5. audioText: Long, conversational, explaining the intuition and solution step-by-step.
6. complexity: Clearly state Time and Space Complexity with explanation of dominant factors.

Return ONLY valid JSON matching the schema provided.
Do NOT include markdown, backticks, or extra keys.
`;


    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, // slightly lower for more consistent JSON
      },
    });

    const responseText = result.response.text();

    if (!responseText) {
      console.error("Gemini returned empty response");
      return res.status(500).json({ error: "Gemini returned empty response." });
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      console.error("Failed to parse Gemini response:", responseText);
      return res.status(500).json({ error: "Invalid JSON from Gemini API." });
    }

    return res.status(200).json({
      problem,
      solutions: parsed.solutions,
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(error?.status || 500).json({ error: "Failed to generate 4 solutions." });
  }
}
