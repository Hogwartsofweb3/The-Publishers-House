/**
 * CMS default data — PURE constants, NO server imports.
 * Safe to import from any page, client component, or API route.
 * API routes and server pages fetch live data from Firestore and fall back
 * to these values. CMS editor pages use these as initial form state.
 */

export const DEFAULT_ABOUT_DATA = {
  heroEyebrow: "Psalm 68:11 · Company of the Great",
  heroHeadline: "An Apostolic House Commissioned to Publish Christ",
  heroLede:
    "Established in 2020 under the leadership of Dr. Joshua Agunbiade, The Publishers House is committed to equipping believers, strengthening the Church, and advancing the Kingdom through scriptural teaching, spiritual revival, and apologetics.",
  vision:
    "To raise a company of believers whose lives, character, and doctrine become living publications of Jesus Christ across every sphere of society and every nation.",
  mission:
    "Equipping the saints through the accurate ministry of the Word, prevailing prayer, apostolic sending, and intentional discipleship.",
  history:
    "The Publishers House began in Jos as a mandate rooted in Psalm 68:11 — 'The Lord gave the word: great was the company of those that published it.' After meeting in Korinjoh House and experiencing rapid spiritual and numeric expansion, the ministry has acquired permanent land and continues to reach thousands through gatherings, conferences, recordings, and media.",
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

export const DEFAULT_GIVING_DATA = {
  accountName: "The Publishers House",
  sterlingAccounts: [
    { currency: "NAIRA", number: "0082457106", label: "General Offering / Tithe" },
    { currency: "DOLLAR", number: "0083163086", label: "Domiciliary (USD)" },
    { currency: "PROJECTS ACCOUNT (NAIRA)", number: "0086985670", label: "Building & Projects" },
  ],
  gtbAccounts: [
    { currency: "NAIRA", number: "0869912273", label: "General Offering / Tithe" },
    { currency: "DOLLAR", number: "0885570536", label: "Domiciliary (USD)" },
    { currency: "EUROS", number: "0885570550", label: "Domiciliary (EUR)" },
    { currency: "POUNDS", number: "0885570543", label: "Domiciliary (GBP)" },
  ],
  zenithAccounts: [
    { currency: "NAIRA", number: "1228493012", label: "Festival of Light / Missions" },
  ],
  evmAddress: "0x063F4fa58078f6c2F1cbCb0D9EA15962Af5BBDaE",
  solAddress: "54CnBrza7uivgHvXCa7ym9LNi9KLwxkXR1vT77mbBxVk",
  suiAddress: "0xaaa4e6301a452139d1b93bd72dda49ddde76f64d253163a19c827f11b8cec63c",
  categories: ["Tithe", "Offering", "Special Projects", "Thanksgiving", "First Fruit", "Missions"],
};

export type ResourceTrack = {
  title: string;
  scripture: string;
  eyebrow: string;
  lede: string;
  description: string;
  materials: {
    part: string;
    title: string;
    speaker: string;
    duration: string;
    youtubeUrl?: string;
    audioUrl?: string;
    pdfUrl?: string;
    notesUrl?: string;
    scripture?: string;
    overview?: string;
    description?: string;
    date?: string;
    tags?: string;
    published?: boolean;
  }[];
};

export const TRACK_DETAILS: Record<string, ResourceTrack> = {
  "how-to-preach-the-gospel": {
    title: "How to Preach the Gospel",
    scripture: "Romans 1:16 · 1 Corinthians 15:1-4 · 2 Timothy 4:2",
    eyebrow: "Apostolic Evangelism & Kerygma",
    lede: "Foundational training and biblical conviction for evangelism and proclaiming Christ unashamedly across our generation.",
    description: "The gospel is not advice on how to live; it is news about what has already been accomplished by Jesus Christ. In this training course, Dr. Joshua Agunbiade unpacks the theology of the proclamation (Kerygma), how to preach Christ from all of Scripture, and the supernatural boldness required to witness in contemporary culture.",
    materials: [
      { part: "Part 1", title: "The Heart of the Kerygma: Christ Crucified", speaker: "Dr. Joshua Agunbiade", duration: "54:12" },
      { part: "Part 2", title: "Confronting the Wisdom of the Age with Truth", speaker: "Dr. Joshua Agunbiade", duration: "58:30" },
      { part: "Part 3", title: "Signs, Wonders, and the Demonstration of Power", speaker: "Dr. Joshua Agunbiade", duration: "1:02:15" },
      { part: "Part 4", title: "Following Up and Discipling New Converts", speaker: "Pastor Damilare Agunbiade", duration: "48:50" },
    ],
  },
  "basic-prayer-classes": {
    title: "Basic Prayer Classes",
    scripture: "Luke 11:1 · Jude 1:20 · 1 Thessalonians 5:17",
    eyebrow: "Spiritual Disciplines & Communion",
    lede: "A systematic spiritual guide to answered prayer, communion with the Father, and prevailing in the Spirit.",
    description: "Prayer is both the breath of the believer and the engine of Kingdom advancement. This class moves beyond ritualistic praying into deep fellowship with the Holy Ghost, intercession, travailing for the lost, and building spiritual stamina.",
    materials: [
      { part: "Module 1", title: "The Fatherhood of God and the Confidence of Prayer", speaker: "Dr. Joshua Agunbiade", duration: "50:20" },
      { part: "Module 2", title: "Praying in the Holy Ghost: Edification & Mysteries", speaker: "Dr. Joshua Agunbiade", duration: "1:05:00" },
      { part: "Module 3", title: "Intercession: Standing in the Gap for Nations and Families", speaker: "Dr. Joshua Agunbiade", duration: "56:40" },
      { part: "Module 4", title: "Hindrances to Answered Prayer and Spiritual Warfare", speaker: "Pastor Damilare Agunbiade", duration: "52:10" },
    ],
  },
  "40-days-prayer-and-fasting": {
    title: "40 DAYS PRAYER & FASTING: DEVOTIONAL",
    scripture: "Matthew 6:16-18 · Isaiah 58:6-12 · Psalm 68:11",
    eyebrow: "Annual Consecration & Revival",
    lede: "Annual church-wide consecrated devotional, spiritual warfare prayers, and corporate fasting guide for breakthrough.",
    description: "Consecration is the doorway to fresh anointing and divine direction. The 40 Days of Prayer & Fasting Devotional provides daily scripture readings, prophetic confessions, and targeted prayer focuses for spiritual revival in your personal walk and church family.",
    materials: [
      { part: "Day 1-10", title: "Consecration, Repentance & Purity of Heart", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 11-20", title: "Supernatural Health, Healing & Divine Preservation", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 21-30", title: "Financial Increase, Open Doors & Kingdom Labour", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 31-40", title: "Revival in Jos, Territorial Anointing & Global Commission", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
    ],
  },
  "the-doctrine-of-christ": {
    title: "The doctrine of Christ",
    scripture: "Hebrews 6:1-2 · John 7:16-17 · 2 John 1:9",
    eyebrow: "Apostolic Foundations",
    lede: "Exposition of Hebrews 6:1-2 and the apostolic core of the Christian faith, repentance from dead works, and eternal judgment.",
    description: "Without deep biblical roots in the doctrine of Christ, believers remain susceptible to false teachings and theological wind. This series systematically breaks down the six foundational pillars of Christianity recorded in Hebrews 6, anchoring every student in Christology and New Testament truth.",
    materials: [
      { part: "Pillar 1", title: "Repentance from Dead Works and Faith Toward God", speaker: "Dr. Joshua Agunbiade", duration: "1:10:00" },
      { part: "Pillar 2", title: "The Doctrine of Baptisms: Water and the Holy Ghost", speaker: "Dr. Joshua Agunbiade", duration: "59:45" },
      { part: "Pillar 3", title: "Laying on of Hands: Impartation and Ministry Order", speaker: "Dr. Joshua Agunbiade", duration: "55:18" },
      { part: "Pillar 4", title: "Resurrection of the Dead and Eternal Judgment", speaker: "Dr. Joshua Agunbiade", duration: "1:15:20" },
    ],
  },
  "work-and-increase": {
    title: "Work & Increase",
    scripture: "Genesis 2:15 · Proverbs 10:4 · Ephesians 4:28 · 2 Thessalonians 3:10",
    eyebrow: "Kingdom Marketplace & Diligence",
    lede: "The theology of labour, biblical stewardship, workplace excellence, and Kingdom economic increase.",
    description: "God is a worker, and labour is a divine institution given before the fall. Work & Increase equips believers to view their vocation, business, and daily craft as a pulpit for righteousness, while unleashing the biblical principles of diligence, covenant seedtime and harvest, and multi-generational increase.",
    materials: [
      { part: "Session 1", title: "The Dignity of Work and Marketplace Calling", speaker: "Dr. Joshua Agunbiade", duration: "52:40" },
      { part: "Session 2", title: "Wisdom for Financial Increase & Overcoming Debt", speaker: "Dr. Joshua Agunbiade", duration: "1:04:10" },
      { part: "Session 3", title: "Biblical Diligence: The Cure for Poverty and Entitlement", speaker: "Dr. Joshua Agunbiade", duration: "49:30" },
      { part: "Session 4", title: "Partnership with the Gospel: The True Goal of Wealth", speaker: "Dr. Joshua Agunbiade", duration: "58:00" },
    ],
  },
  "grace-for-grace": {
    title: "Grace for Grace",
    scripture: "John 1:16-17 · Romans 5:17 · 2 Corinthians 12:9",
    eyebrow: "The Abundance of Divine Provision",
    lede: "Understanding the fullness of Christ, unearned righteousness, and the dynamic covenant of divine enabling.",
    description: "Grace is not a license for passivity; it is the divine influence upon the heart and its reflection in the life. In Grace for Grace, believers explore the distinction between Law and Gospel, how to reign in life through righteousness, and receiving daily strength for every trial.",
    materials: [
      { part: "Chapter 1", title: "Out of His Fullness: From Law to Truth", speaker: "Dr. Joshua Agunbiade", duration: "56:20" },
      { part: "Chapter 2", title: "Justification by Faith: Free from Condemnation", speaker: "Dr. Joshua Agunbiade", duration: "1:01:00" },
      { part: "Chapter 3", title: "Sufficiency in Weakness: Grace for Hard Seasons", speaker: "Dr. Joshua Agunbiade", duration: "54:15" },
      { part: "Chapter 4", title: "Grace That Teaches: Holy Living and Kingdom Service", speaker: "Dr. Joshua Agunbiade", duration: "50:45" },
    ],
  },
};

