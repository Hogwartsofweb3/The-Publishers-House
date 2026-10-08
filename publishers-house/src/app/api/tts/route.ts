import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { getCuratedArticleBySlug } from "@/lib/articlesCurated";
import { getArticleBySlug } from "@/lib/firebase";

async function generateAudioStream(textToNarrate: string): Promise<Buffer> {
  // Truncate if unreasonably long for a single request
  const maxChars = 8000;
  const finalText = textToNarrate.length > maxChars ? textToNarrate.slice(0, maxChars) + "..." : textToNarrate;

  // 1. Fish Audio (if configured)
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
        const arr = await fishRes.arrayBuffer();
        return Buffer.from(arr);
      }
    } catch (e) {
      console.warn("Fish Audio failed, falling back:", e);
    }
  }

  // 2. ElevenLabs (if configured)
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
        const arr = await elevenRes.arrayBuffer();
        return Buffer.from(arr);
      }
    } catch (e) {
      console.warn("ElevenLabs failed, falling back:", e);
    }
  }

  // 3. Microsoft Neural Voice (en-NG-AbeoNeural: natural Nigerian pastoral voice)
  const tts = new MsEdgeTTS();
  await tts.setMetadata("en-NG-AbeoNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = await tts.toStream(finalText);

  const chunks: Buffer[] = [];
  audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
  await new Promise((resolve, reject) => {
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
  });

  return Buffer.concat(chunks);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const isDownload = searchParams.get("download") === "1";

    if (!slug) {
      return NextResponse.json({ error: "No slug provided" }, { status: 400 });
    }

    const article = getCuratedArticleBySlug(slug) || await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.audioUrl && article.audioUrl.startsWith("http")) {
      return NextResponse.redirect(article.audioUrl);
    }

    const cleanText = (article.body || article.excerpt || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const textToNarrate = article.title ? `${article.title}. ${cleanText}` : cleanText;
    const audioBuffer = await generateAudioStream(textToNarrate);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": isDownload
          ? `attachment; filename="${slug}.mp3"`
          : `inline; filename="${slug}.mp3"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error("GET TTS error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, title } = await req.json();

    if (!text && !title) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const cleanText = (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const narrationText = title ? `${title}. ${cleanText}` : cleanText;
    const audioBuffer = await generateAudioStream(narrationText);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="narration.mp3"`,
      },
    });
  } catch (err: any) {
    console.error("POST TTS error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
