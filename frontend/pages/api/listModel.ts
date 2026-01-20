import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Make sure the API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);

    // Call listModels without any extra params
    const models = await client.listModels();

    return res.status(200).json({ models });
  } catch (err: any) {
    console.error("List models error:", err);
    return res.status(500).json({
      error: "Failed to list models",
      details: err.message || err,
    });
  }
}
