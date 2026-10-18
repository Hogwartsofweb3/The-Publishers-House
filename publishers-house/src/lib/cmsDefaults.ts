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
