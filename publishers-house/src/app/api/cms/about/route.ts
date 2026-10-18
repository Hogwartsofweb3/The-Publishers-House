import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DEFAULT_ABOUT_DATA = {
  heroEyebrow: "Psalm 68:11 · Company of the Great",
  heroHeadline: "An Apostolic House Commissioned to Publish Christ",
  heroLede: "Established in 2020 under the leadership of Dr. Joshua Agunbiade, The Publishers House is committed to equipping believers, strengthening the Church, and advancing the Kingdom through scriptural teaching, spiritual revival, and apologetics.",
  vision: "To raise a company of believers whose lives, character, and doctrine become living publications of Jesus Christ across every sphere of society and every nation.",
  mission: "Equipping the saints through the accurate ministry of the Word, prevailing prayer, apostolic sending, and intentional discipleship.",
  history: "The Publishers House began in Jos as a mandate rooted in Psalm 68:11 — 'The Lord gave the word: great was the company of those that published it.' After meeting in Korinjoh House and experiencing rapid spiritual and numeric expansion, the ministry has acquired permanent land and continues to reach thousands through gatherings, conferences, recordings, and media.",
  beliefs: [
    {
      title: "The Scriptures",
      body: "We hold the sixty-six books of the Old and New Testaments to be the inspired Word of God, entirely trustworthy, and the final authority for what the church believes and how it lives.",
      scripture: "2 Timothy 3:16",
    },
    {
      title: "The Trinity",
      body: "We firmly believe in one God who has revealed Himself eternally as Father, Son, and Holy Spirit — equal in power, majesty, and glory.",
      scripture: "Matthew 28:19",
    },
    {
      title: "The Holy Spirit",
      body: "We believe the Holy Spirit is at work now, illuminating Scripture, sanctifying the believer, and empowering the church for witness with spiritual gifts that have not ceased.",
      scripture: "1 Corinthians 12:7",
    },
    {
      title: "The Church and the Apostolic Mandate",
      body: "We confess one holy, catholic, and apostolic church, gathered by the gospel and sent to publish it, equipped by apostles, prophets, evangelists, pastors, and teachers.",
      scripture: "Ephesians 4:11-12",
    },
    {
      title: "The Believer as Publisher",
      body: "Every believer carries a divine commission to publish the Word, in speech, character, and vocation across nations, industries, and generations.",
      scripture: "Psalm 68:11",
    },
  ],
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("church_about").get();
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_ABOUT_DATA);
    }
    return NextResponse.json({ ...DEFAULT_ABOUT_DATA, ...doc.data() });
  } catch (err: any) {
    return NextResponse.json(DEFAULT_ABOUT_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await getAdminDb().collection("settings").doc("church_about").set(cleanData, { merge: true });
    return NextResponse.json({ ok: true, data: cleanData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
