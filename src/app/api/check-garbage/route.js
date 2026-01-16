import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { base64Image, mimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
       console.error("Vercel Key Status: NOT FOUND");
       return Response.json({ isGarbage: false, explanation: "Server Error: API Key not found in Environment" }, { status: 500 });
    }
    
    if (!apiKey) {
  return Response.json(
    { 
      isGarbage: false, 
      explanation: `Environment Variable Missing! Current Keys: ${Object.keys(process.env).filter(k => k.includes('GEMINI'))}` 
    },
    { status: 500 }
  );
}

    if (!base64Image || !mimeType) {
      return Response.json(
        { isGarbage: false, explanation: "Image data or mime type missing" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = "Analyze this image. Is there any garbage, waste, or litter visible? Describe what you see briefly and end with 'RESULT: YES' or 'RESULT: NO'.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("AI Response:", text);

    if (!text) {
      return Response.json(
        { isGarbage: false, explanation: "AI returned empty response" },
        { status: 500 }
      );
    }

    const isGarbage = text.toUpperCase().includes("RESULT: YES");

    return Response.json({
      isGarbage,
      explanation: text,
    });
  } catch (error) {
    console.error("Garbage Check Error:", error);
    return Response.json(
      {
        isGarbage: false,
        explanation: "AI Error: " + error.message,
      },
      { status: 500 }
    );
  }
}