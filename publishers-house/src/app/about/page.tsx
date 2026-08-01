import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover who we are, what to expect, our beliefs, and the leadership of The Publishers House Church.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className="container">
            <p className="overline">Get to know us</p>
            <h1>About The Publishers House</h1>
          </div>
        </section>

        {/* Section A: Who We Are */}
        <section className="section" id="who-we-are">
          <div className="container grid-2" style={{ alignItems: "center", gap: "var(--space-16)" }}>
            <div>
              <p className="overline">Who We Are</p>
              <h2>Built on the Word,<br />Rooted in Community</h2>
              <div className="divider" />
              <p style={{ maxWidth: "none" }}>
                {/* TODO: Replace with official mission/vision from Patricia/AVO */}
                We are The Publishers House — a church family passionate about the Word of God,
                Spirit-filled worship, and authentic community. We believe the local church is God's
                primary instrument for the transformation of lives and communities.
              </p>
              <p style={{ maxWidth: "none", marginTop: "var(--space-4)" }}>
                Founded on the conviction that every believer carries a message — a divine publishing
                mandate — we are a people sent to declare and demonstrate the Kingdom of God wherever
                we are planted.
              </p>
            </div>
            <div className={styles.imageFrame}>
              {/* TODO: Replace src with actual church photo from AVO */}
              <div className={styles.imagePlaceholder}>
                <span>Church Photo Here</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: What to Expect */}
        <section className="section section--warm" id="what-to-expect">
          <div className="container">
            <div className="section-header">
              <p className="overline">What to Expect</p>
              <h2>Planning Your First Visit?</h2>
              <p>Here is what you can look forward to when you join us.</p>
            </div>
            <div className="grid-3">
              {expectItems.map((item) => (
                <div key={item.title} className={styles.expectCard}>
                  <span className={styles.expectIcon}>{item.icon}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section C: Our Beliefs */}
        <section className="section" id="our-beliefs">
          <div className="container">
            <div className="section-header">
              <p className="overline">What We Believe</p>
              <h2>Our Beliefs</h2>
              <p>Our doctrine is rooted in the timeless truth of Scripture.</p>
            </div>
            <div className="grid-2">
              {/* TODO: Replace with actual beliefs from Patricia/AVO */}
              {beliefs.map((belief) => (
                <div key={belief.title} className={styles.beliefCard}>
                  <h5>{belief.title}</h5>
                  <p>{belief.statement}</p>
                  {belief.scripture && (
                    <span className={styles.scripture}>{belief.scripture}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section D: Leadership */}
        <section className="section section--warm" id="leadership">
          <div className="container">
            <div className="section-header">
              <p className="overline">Our Team</p>
              <h2>Meet the Leadership</h2>
            </div>
            {/* TODO: Replace with dynamic data from Strapi once Samson deploys */}
            <div className="grid-3">
              {placeholderLeaders.map((leader) => (
                <div key={leader.name} className={styles.leaderCard}>
                  <div className={styles.leaderPortrait}>
                    <span>{leader.initials}</span>
                  </div>
                  <h5>{leader.name}</h5>
                  <p className={styles.leaderTitle}>{leader.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ---- Static data (placeholder until CMS is live) ----
const expectItems = [
  { icon: "🎵", title: "Worship", desc: "Spirit-filled, contemporary worship that glorifies God and engages your whole being." },
  { icon: "📖", title: "The Word", desc: "Expository, Bible-based preaching that is practical, relevant, and life-changing." },
  { icon: "🤝", title: "Community", desc: "Warm, welcoming people who are genuinely excited to meet you." },
  { icon: "🙏", title: "Prayer", desc: "A culture of prayer — we believe it changes everything." },
  { icon: "👧", title: "Children", desc: "A safe, fun, and spiritually enriching environment for your little ones." },
  { icon: "📍", title: "Directions", desc: "Easy to find, with clear signage and friendly volunteers to help you." },
];

const beliefs = [
  { title: "The Holy Scriptures", statement: "We believe the Bible is the inspired, infallible Word of God, the supreme authority in all matters of faith and conduct.", scripture: "2 Timothy 3:16–17" },
  { title: "The Trinity", statement: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit.", scripture: "Matthew 28:19" },
  { title: "Jesus Christ", statement: "We believe in the deity of Jesus Christ, His virgin birth, sinless life, atoning death, bodily resurrection, and ascension.", scripture: "John 1:1, 14" },
  { title: "Salvation", statement: "We believe that salvation is by grace through faith alone, not by works — a free gift of God.", scripture: "Ephesians 2:8–9" },
  { title: "The Holy Spirit", statement: "We believe in the present-day ministry of the Holy Spirit, who empowers believers for life and service.", scripture: "Acts 1:8" },
  { title: "The Church", statement: "We believe the Church is the body of Christ, called to worship, grow, and extend the Kingdom of God.", scripture: "Ephesians 1:22–23" },
];

const placeholderLeaders = [
  { name: "Pastor [Name]", title: "Senior Pastor", initials: "SP" },
  { name: "[Name]", title: "Associate Pastor", initials: "AP" },
  { name: "[Name]", title: "Youth Pastor", initials: "YP" },
];
