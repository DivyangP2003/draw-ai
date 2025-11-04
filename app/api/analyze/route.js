import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTagsFromAnalysis } from "@/utils/tagExtractor";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt =
      "Analyze this drawing. If it contains mathematical equations, solve them. If it contains graphs, explain them. If it contains questions, answer them. Be concise but thorough.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/png",
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const analysis = await result.response.text();
    const tags = extractTagsFromAnalysis(analysis);

    return new Response(JSON.stringify({ analysis, tags }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to analyze image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}