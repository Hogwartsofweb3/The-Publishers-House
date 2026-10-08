import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export async function POST(req: NextRequest) {
  try {
    const { text, title } = await req.json();

    if (!text && !title) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Clean text by stripping HTML tags and excess whitespace
    const cleanText = (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const narrationText = title ? `${title}. ${cleanText}` : cleanText;

    // Truncate if unreasonably long for a single request
    const maxChars = 8000;
    const finalText = narrationText.length > maxChars ? narrationText.slice(0, maxChars) + "..." : narrationText;

    // ── 1. Provider: Fish Audio (Free Tier Voice Clone) ────────────────
    const fishApiKey = process.env.FISH_AUDIO_API_KEY;
    const fishModelId = process.env.FISH_AUDIO_MODEL_ID;

    if (fishApiKey && fishModelId) {
      try {
        const fishRes = await fetch("https://api.fish.audio/v1/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${fishApiKey}`,
          },
          body: JSON.stringify({
            text: finalText,
            reference_id: fishModelId,
            format: "mp3",
          }),
        });

        if (fishRes.ok) {
          const fishBuffer = await fishRes.arrayBuffer();
          return new NextResponse(fishBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Disposition": `inline; filename="narration.mp3"`,
            },
          });
        }
      } catch (e) {
        console.warn("Fish Audio failed, falling back to neural TTS:", e);
      }
    }

    // ── 2. Provider: ElevenLabs (If configured) ───────────────────────
    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID;

    if (elevenApiKey && elevenVoiceId) {
      try {
        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenApiKey,
            },
            body: JSON.stringify({
              text: finalText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.85,
                style: 0.1,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (elevenRes.ok) {
          const elevenBuffer = await elevenRes.arrayBuffer();
          return new NextResponse(elevenBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Disposition": `inline; filename="narration.mp3"`,
            },
          });
        }
      } catch (e) {
        console.warn("ElevenLabs failed, falling back to neural TTS:", e);
      }
    }

    // ── 3. Provider: Microsoft Neural Voice (100% Free, Zero Setup) ──
    // Uses en-NG-AbeoNeural: natural, authentic Nigerian male English pastoral voice
    const tts = new MsEdgeTTS();
    await tts.setMetadata("en-NG-AbeoNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(finalText);

    const chunks: Buffer[] = [];
    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    await new Promise((resolve, reject) => {
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
    });

    const audioBuffer = Buffer.concat(chunks);

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
