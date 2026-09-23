import { NextResponse } from "next/server";
import Parser from "rss-parser";

export async function GET() {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL("https://thepublisherspen.wordpress.com/author/ngbedethepublisher/feed/");
    return NextResponse.json({ items: feed.items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
