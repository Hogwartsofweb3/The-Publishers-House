import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, title, voiceId } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !targetVoiceId) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not configured in .env.local" },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Strip any HTML tags from text
    const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const narrationText = title ? `${title}. ${cleanText}` : cleanText;

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: narrationText,
          model_id: "eleven_multilingual_v2", // Best for natural inflection and accents
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.1,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs API error: ${errData}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="narration.mp3"`,
      },
    });
  } catch (err: any) {
    console.error("TTS generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
