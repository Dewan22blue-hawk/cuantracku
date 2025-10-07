import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are a friendly and helpful financial assistant. Your goal is to provide insightful and easy-to-understand advice based on the user-provided transaction data. When asked for summaries or analysis, always present the data clearly, for example, using formatted currency (IDR) and bullet points. Keep your answers concise and to the point.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Tentu, saya siap membantu! Silakan berikan data transaksi Anda atau ajukan pertanyaan.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get response from AI", details: errorMessage },
      { status: 500 }
    );
  }
}
