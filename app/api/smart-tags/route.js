import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTagsFromAnalysis } from "@/utils/tagExtractor";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { analysisText } = await request.json();

    if (!analysisText || analysisText.trim() === "") {
      return new Response(
        JSON.stringify({ error: "No analysis text provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an intelligent tag generator. Based on the following analysis text, extract 3 to 5 relevant academic or conceptual tags.
The tags should be single words like "math", "geometry", "algebra", "physics", "energy", "biology", etc.
Return ONLY a JSON array of strings (example: ["math", "geometry"]).
Text:
${analysisText}
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      // Try to parse JSON-like response from Gemini
      let aiTags = [];
      try {
        aiTags = JSON.parse(responseText);
      } catch {
        // fallback: try to extract ["tag1", "tag2"] manually
        const match = responseText.match(/\[(.*?)\]/);
        if (match) {
          aiTags = match[1]
            .split(",")
            .map((t) => t.replace(/["'\s]/g, ""))
            .filter(Boolean);
        }
      }

      // ✅ If AI returns valid tags
      if (Array.isArray(aiTags) && aiTags.length > 0) {
        return new Response(JSON.stringify({ tags: aiTags }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // ⚙️ Otherwise fallback to local extractor
      const fallbackTags = extractTagsFromAnalysis(analysisText);
      return new Response(JSON.stringify({ tags: fallbackTags }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (aiError) {
      console.error("Gemini tagging error:", aiError);

      // 🧠 Fallback in case Gemini fails
      const fallbackTags = extractTagsFromAnalysis(analysisText);
      return new Response(JSON.stringify({ tags: fallbackTags }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Tag generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
