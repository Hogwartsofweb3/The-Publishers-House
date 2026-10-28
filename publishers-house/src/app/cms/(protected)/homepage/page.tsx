"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, getDoc, doc, where, limit } from "firebase/firestore";
import Link from "next/link";

/* ── tokens ── */
const Navy   = "#151A54";
const Blue700= "#0140C1";
const Blue500= "#2090FF";
const Paper100="#F4F6FB";
const Paper200="#E8ECF7";
const Paper300="#D3DAEC";
const White  = "#FFFFFF";
const Slate500="#747CA1";
const Green  = "#16A34A";
const Red    = "#DC2626";

const lbl: React.CSSProperties = { fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"11px", letterSpacing:"0.16em", textTransform:"uppercase", display:"block", marginBottom:"6px", color:"#4A62A0" };
const inp: React.CSSProperties = { width:"100%", padding:"10px 12px", border:`1px solid ${Paper300}`, borderRadius:"4px", fontFamily:"'Playfair Display',serif", fontSize:"15px", outline:"none", backgroundColor:White, boxSizing:"border-box" };
const ta: React.CSSProperties  = { ...inp, minHeight:"80px", resize:"vertical" };
const btn = (bg: string, color: string): React.CSSProperties => ({ padding:"8px 18px", backgroundColor:bg, color, border:"none", borderRadius:"4px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"11px", letterSpacing:"0.14em", textTransform:"uppercase" });
const card: React.CSSProperties= { backgroundColor:White, border:`1px solid ${Paper300}`, borderRadius:"8px", padding:"28px", marginBottom:"20px" };
const row2: React.CSSProperties= { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" };
const row3: React.CSSProperties= { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" };
const row4: React.CSSProperties= { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"16px" };

const TABS = ["hero","setman","gatherings","teaching","articles","whoweare","announcement","giving"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = { hero:"Hero", setman:"Welcome", gatherings:"This Week", teaching:"Latest Teaching", articles:"Articles Carousel", whoweare:"Who We Are", announcement:"Announcement", giving:"Giving" };

const EMPTY_G = { day:"", date:"", month:"", title:"", desc:"", scripture:"", time:"", city:"Jos", theme:"", speaker:"Rev. Joshua Agunbiade", flierUrl:"", order:0, published:true, eventId:"", registrationUrl:"" };

const DEF: Record<string, any> = {
  heroEyebrow:"Psalm 68:11", heroHeadline:"Company of the Great",
  heroSubtitle:"An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
  heroBtn1Label:"Plan Your Visit", heroBtn1Url:"/about",
  heroBtn2Label:"Watch the Last Teaching", heroBtn2Url:"/resources",
  heroSundayLabel:"Sunday Worship", heroSundayTime:"9:00 AM",
  heroMidweekLabel:"Midweek Service", heroMidweekTime:"5:00 PM",
  heroAddress:"The House of Bread, Korinjoh House, British, Jos · West Africa Time",
  heroBgImage:"/images/hero-v2.webp",
  setmanHeading:"WELCOME MESSAGE\nFROM THE SETMAN",
  setmanSubtext:"The Publishers House is an Apostolic community devoted to sound biblical teaching, prayer, and equipping believers to reflect Christ in their generation. Inspired by Psalm 68:11, we welcome you to the Company of the Great.",
  setmanBtnLabel:"READ MORE ABOUT US", setmanBtnUrl:"/about",
  setmanPhotoUrl:"/images/rja-setman.jpg",
  gatheringsLabel:"Next Gatherings", gatheringsHeading:"This Week at the House",
  gatheringsImages: ["/images/event-1.webp", "/images/event-2.webp", "/images/event-3.webp"],
  articlesCarouselShow: true,
  articlesCarouselEyebrow: "From the Articles",
  articlesCarouselHeading: "Worth Reading",
  teachingEyebrow:"The Latest Teaching", teachingHeading:"Published This Week",
  teachingSeriesEyebrow:"Foundations · Part Eight", teachingTitle:"A Workman Unashamed",
  teachingDesc:"What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  teachingBtn1Label:"Listen — 48:12", teachingBtn1Url:"/resources",
  teachingBtn2Label:"Read the Transcript", teachingBtn2Url:"/resources",
  teachingColophon:"2 Timothy 2:15,Foundations,Dr. Joshua Agunbiade,Jos,48:12",
  teachingImageUrl:"/images/sermon-v2.webp",
  whoEyebrow:"Who We Are",
  whoQuote:"Every believer is commissioned to become a publisher of God's message.",
  whoBody:"Established in 2020 under the leadership of Dr. Joshua Agunbiade, the ministry exists to equip believers, strengthen the Church and advance the Kingdom through biblical teaching, revival and apologetics.",
  whoBtnLabel:"Read What We Believe", whoBtnUrl:"/about",
  whoBgImage:"/images/who-we-are-v2.webp",
  annShow:true, annHeading:"Special Announcement",
  annSubheading:"We Are Building",
  annBody:"After five years in rented spaces, The Publishers House has acquired land for a permanent home! We are now building a multi-purpose center featuring an auditorium, lecture halls, offices, and a media studio to continue publishing the Gospel across the nations.",
  annBtn1Label:"Give Now", annBtn1Url:"/giving",
  annBtn2Label:"", annBtn2Url:"",
  annImageUrl:"/images/9528ca88db079ef5fecf726b4f42a332798a6fcc.jpg",
  givingEyebrow:"Giving", givingHeading:"Your Giving Publishes the Word",
  givingBody:"Gifts to this house pay for the gatherings, the recording and transcription of every teaching, and the programmes that carry the Word beyond Jos.",
  givingBtnLabel:"Give Now", givingBtnUrl:"/giving",
  givingBgImage:"/images/giving-bg.webp",
  givingCategories:"Tithe,Offering,Special Projects,Thanksgiving",
};

export default function HomepageEditor() {
  const [tab, setTab] = useState<Tab>("gatherings");
  const [settings, setSettings] = useState<any>({ ...DEF });
  const [gatherings, setGatherings] = useState<any[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [liveSermons, setLiveSermons] = useState<any[]>([]);
  const [gForm, setGForm] = useState({ ...EMPTY_G });
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };
  const S = (k: string, v: any) => setSettings((s: any) => ({ ...s, [k]: v }));
  const G = (k: string, v: any) => setGForm((f) => ({ ...f, [k]: v }));

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/cms/homepage");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings((p: any) => ({ ...DEF, ...p, ...data.settings }));
        if (data.gatherings) setGatherings(data.gatherings);
        return;
      }
    } catch {}
    const snap = await getDoc(doc(db, "homeSettings", "main"));
    if (snap.exists()) setSettings((p: any) => ({ ...DEF, ...p, ...(snap.data() as any) }));
  };

  const fetchGatherings = async () => {
    try {
      const res = await fetch("/api/cms/homepage");
      if (res.ok) {
        const data = await res.json();
        if (data.gatherings) {
          setGatherings(data.gatherings);
          return;
        }
      }
    } catch {}
    const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order","asc")));
    setGatherings(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  };

  const fetchScheduleEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("/api/cms/events");
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setScheduleEvents(data.events);
        }
      }
    } catch (e) {
      console.error("Failed to load schedule events:", e);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchLiveSermons = async () => {
    try {
      const q = query(
        collection(db, "sermons"),
        where("published", "==", true),
        orderBy("date", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setLiveSermons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {}
  };

  useEffect(() => {
    fetchSettings();
    fetchGatherings();
    fetchLiveSermons();
    fetchScheduleEvents();
  }, []);

  const importEventToGathering = (ev: any) => {
    try {
      const rawDate = ev.startAt || ev.date;
      const d = rawDate ? new Date(rawDate) : new Date();
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

      let formattedTime = "";
      if (!isNaN(d.getTime())) {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const h12 = hours % 12 || 12;
        const mStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
        formattedTime = `${h12}${mStr} ${ampm} WAT`;
      }

      // Check if this event already exists in gatherings
      const existing = gatherings.find((g: any) =>
        (g.eventId && g.eventId === ev.id) ||
        (g.title && g.title.toLowerCase().trim() === (ev.title || "").toLowerCase().trim())
      );

      if (existing) {
        setEditId(existing.id);
        setGForm({
          ...EMPTY_G,
          ...existing,
          eventId: ev.id,
          flierUrl: existing.flierUrl || ev.imageUrl || "",
          registrationUrl: existing.registrationUrl || ev.registrationUrl || "",
        });
        flash(`Editing existing gathering linked to "${ev.title}". Update details below!`);
      } else {
        setEditId(null);
        setGForm({
          ...EMPTY_G,
          eventId: ev.id,
          title: ev.title || "",
          theme: ev.summary || "Upcoming Flagship Gathering",
          desc: ev.description || "",
          speaker: ev.speaker || "Rev. Joshua Agunbiade",
          scripture: ev.scripture || "",
          city: ev.location ? ev.location.split(",")[0].trim() : "Jos",
          flierUrl: ev.imageUrl || "",
          registrationUrl: ev.registrationUrl || "",
          day: !isNaN(d.getTime()) ? dayNames[d.getDay()] : "WED",
          date: !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, "0") : "28",
          month: !isNaN(d.getTime()) ? monthNames[d.getMonth()] : "OCT",
          time: formattedTime || "4:00 PM WAT",
          published: true,
          order: 0,
        });
        flash(`Imported "${ev.title}" from /schedule! Review and save below.`);
      }

      const el = document.getElementById("gathering-form-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (e: any) {
      flash("Error importing event: " + e.message);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          settings,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save settings");
      }
      flash("Saved ✓ — changes will appear on the homepage shortly.");
    } catch (e: any) {
      flash("Error: " + e.message);
    }
    setSaving(false);
  };

  const saveGathering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gForm.title.trim()) { flash("Title is required"); return; }
    setGLoading(true);
    try {
      const res = await fetch("/api/cms/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_gathering",
          id: editId,
          gathering: gForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save gathering");
      }
      flash(data.message || (editId ? "Gathering updated ✓" : "Gathering added ✓"));
      setGForm({ ...EMPTY_G });
      setEditId(null);
      fetchGatherings();
    } catch (e: any) {
      flash("Error: " + e.message);
    }
    setGLoading(false);
  };

  const deleteG = async (id: string) => {
    if (!confirm("Delete this gathering?")) return;
    try {
      const res = await fetch("/api/cms/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_gathering", id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      fetchGatherings();
    } catch (e: any) {
      flash("Error: " + e.message);
    }
  };

  const togglePublishG = async (g: any) => {
    try {
      const res = await fetch("/api/cms/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_publish_gathering", id: g.id, published: !g.published }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      fetchGatherings();
    } catch (e: any) {
      flash("Error: " + e.message);
    }
  };

  const editG = (g: any) => {
    setGForm({ ...EMPTY_G, ...g });
    setEditId(g.id);
    const el = document.getElementById("gathering-form-anchor");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Field helpers ── */
  const F = (label: string, key: string, placeholder?: string, multiline?: boolean) => (
    <div>
      <label style={lbl}>{label}</label>
      {multiline
        ? <textarea style={ta} value={settings[key]??""} onChange={e => S(key, e.target.value)} placeholder={placeholder} />
        : <input style={inp} value={settings[key]??""} onChange={e => S(key, e.target.value)} placeholder={placeholder} />}
    </div>
  );
  const FRow = (pairs: [string,string,string?][]) => (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${pairs.length},1fr)`, gap:"16px" }}>
      {pairs.map(([label,key,ph]) => F(label,key,ph))}
    </div>
  );

  return (
    <div style={{ maxWidth:"1020px", margin:"0 auto", padding:"40px 24px" }}>
      <Link href="/cms" style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Blue700, textDecoration:"none", display:"block", marginBottom:"24px" }}>← Dashboard</Link>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"32px" }}>
        <h1 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"28px", color:Navy, margin:0 }}>Homepage Editor</h1>
        {msg && <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color: msg.startsWith("Error") ? Red : Green }}>{msg}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0", marginBottom:"32px", borderBottom:`1px solid ${Paper300}` }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"10px 20px", border:"none", borderBottom:tab===t?`2px solid ${Blue700}`:"2px solid transparent", background:"none", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:tab===t?Blue700:Slate500, marginBottom:"-1px" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ───── HERO TAB ───── */}
      {tab==="hero" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Hero Section</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {FRow([["Scripture Eyebrow","heroEyebrow","Psalm 68:11"],["Hero Background Image URL","heroBgImage","/images/hero-v2.webp"]])}
            {F("Main Headline","heroHeadline","Company of the Great")}
            {F("Subtitle / Tagline","heroSubtitle","An apostolic and scriptural ministry...",true)}
            {FRow([["Button 1 Label","heroBtn1Label"],["Button 1 URL","heroBtn1Url","/about"]])}
            {FRow([["Button 2 Label","heroBtn2Label"],["Button 2 URL","heroBtn2Url","/resources"]])}
            <hr style={{ border:"none", borderTop:`1px solid ${Paper300}` }} />
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, margin:0, textTransform:"uppercase", letterSpacing:"0.12em" }}>Service Times Strip</p>
            {FRow([["Sunday Label","heroSundayLabel"],["Sunday Time","heroSundayTime","9:00 AM"]])}
            {FRow([["Midweek Label","heroMidweekLabel"],["Midweek Time","heroMidweekTime","5:00 PM"]])}
            {F("Address / Location Text","heroAddress","The House of Bread, Korinjoh House, British, Jos · West Africa Time")}
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Hero Section"}</button>
          </div>
        </div>
      )}

      {/* ───── SETMAN TAB ───── */}
      {tab==="setman" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Welcome from the Setman</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {F("Section Heading (use \\n for line break)","setmanHeading","Welcome Message\nfrom the Setman",true)}
            {F("Body Text","setmanSubtext","What Paul asks...",true)}
            {FRow([["Button Label","setmanBtnLabel"],["Button URL","setmanBtnUrl","/about"]])}
            {F("Setman Photo URL","setmanPhotoUrl","/images/rja-setman.jpg")}
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Section"}</button>
          </div>
        </div>
      )}

      {/* ───── GATHERINGS TAB ───── */}
      {tab==="gatherings" && (
        <>
          {/* Section labels */}
          <div style={{ ...card, marginBottom:"16px" }}>
            <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"16px", color:Navy, margin:"0 0 16px" }}>Section Labels</h2>
            <div style={row2}>
              {F("Eyebrow Label","gatheringsLabel","Next Gatherings")}
              {F("Section Heading","gatheringsHeading","This Week at the House")}
            </div>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), marginTop:"16px", opacity:saving?0.6:1 }}>Save Labels</button>
          </div>

          {/* 📅 Sync & Edit from /schedule Events */}
          <div style={{ ...card, border:`1px solid #C7D7F5`, backgroundColor:"#F8FAFF", marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px", marginBottom:"14px" }}>
              <div>
                <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"16px", color:Navy, margin:0, display:"flex", alignItems:"center", gap:"8px" }}>
                  <span>📅</span> Upcoming Events from /schedule
                </h2>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:"4px 0 0" }}>
                  Events created in the Schedule CMS appear here. Click <strong>Edit on Next Gatherings</strong> to configure or customize how an event appears on the homepage.
                </p>
              </div>
              <Link
                href="/cms/events"
                style={{
                  fontFamily:"'Poppins',sans-serif",
                  fontSize:"11px",
                  fontWeight:600,
                  color:Blue700,
                  textDecoration:"none",
                  backgroundColor:Paper100,
                  padding:"6px 12px",
                  borderRadius:"4px",
                  border:`1px solid ${Paper300}`,
                }}
              >
                Open Schedule CMS (/cms/events) →
              </Link>
            </div>

            {eventsLoading && (
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:0, padding:"12px 0" }}>
                Loading events from schedule...
              </p>
            )}

            {!eventsLoading && scheduleEvents.length === 0 && (
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:0, padding:"8px 0" }}>
                No events currently found in the schedule database. <Link href="/cms/events" style={{ color:Blue700, fontWeight:600 }}>Create an event in Schedule CMS</Link> to feature it on the homepage.
              </p>
            )}

            {!eventsLoading && scheduleEvents.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {scheduleEvents.map((ev: any) => {
                  const isLinked = gatherings.some((g: any) =>
                    (g.eventId && g.eventId === ev.id) ||
                    (g.title && g.title.toLowerCase().trim() === (ev.title || "").toLowerCase().trim())
                  );
                  const flier = (ev.imageUrl || "").trim();

                  return (
                    <div
                      key={ev.id}
                      style={{
                        backgroundColor: White,
                        border: `1px solid ${isLinked ? "#BFDBFE" : Paper300}`,
                        borderRadius: "6px",
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:"14px", minWidth:0, flex:1 }}>
                        {flier ? (
                          <img
                            src={flier}
                            alt={ev.title}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "4px",
                              objectFit: "cover",
                              border: `1px solid ${Paper200}`,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "4px",
                              backgroundColor: Paper100,
                              border: `1px solid ${Paper300}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "'Poppins',sans-serif",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: Slate500,
                              flexShrink: 0,
                            }}
                          >
                            EVENT
                          </div>
                        )}

                        <div style={{ minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"14px", color:Navy }}>
                              {ev.title}
                            </span>
                            {isLinked ? (
                              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:700, padding:"2px 8px", borderRadius:"10px", backgroundColor:"#DCFCE7", color:Green, textTransform:"uppercase" }}>
                                ✓ Linked to Homepage
                              </span>
                            ) : (
                              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:600, padding:"2px 8px", borderRadius:"10px", backgroundColor:Paper200, color:Slate500, textTransform:"uppercase" }}>
                                In Schedule Only
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"2px" }}>
                            {ev.startAt ? new Date(ev.startAt).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" }) : "No date"}
                            {ev.location ? ` · ${ev.location}` : ""}
                            {ev.speaker ? ` · Speaker: ${ev.speaker}` : ""}
                          </div>
                        </div>
                      </div>

                      <div style={{ display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
                        <button
                          type="button"
                          onClick={() => importEventToGathering(ev)}
                          style={{
                            ...btn(isLinked ? Blue700 : "#EBF2FF", isLinked ? White : Blue700),
                            border: `1px solid ${Blue700}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {isLinked ? "✏️ Edit on Next Gatherings" : "+ Add to Next Gatherings"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add/Edit Gathering Form */}
          <div id="gathering-form-anchor" style={card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
              <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:0 }}>
                {editId ? "Edit Gathering" : "Add New Gathering"}
              </h2>
              {gForm.eventId && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", fontWeight:700, color:Blue700, backgroundColor:"#EBF2FF", border:`1px solid #BFDBFE`, padding:"3px 8px", borderRadius:"4px", textTransform:"uppercase" }}>
                    🔗 Linked to Schedule Event
                  </span>
                  <button
                    type="button"
                    onClick={() => G("eventId", "")}
                    style={{ background:"none", border:"none", color:Slate500, fontSize:"11px", cursor:"pointer", textDecoration:"underline" }}
                    title="Unlink from schedule event"
                  >
                    Unlink
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={saveGathering} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={row2}>
                <div><label style={lbl}>Event Title *</label><input style={inp} value={gForm.title} onChange={e => G("title",e.target.value)} placeholder="e.g. The Time of the Word" required /></div>
                <div><label style={lbl}>Theme / Series</label><input style={inp} value={gForm.theme} onChange={e => G("theme",e.target.value)} placeholder="e.g. Festival of Light — Annual Homecoming" /></div>
              </div>
              <div style={row4}>
                <div><label style={lbl}>Day (SUN / WED)</label><input style={inp} value={gForm.day} onChange={e => G("day",e.target.value.toUpperCase())} maxLength={3} placeholder="SUN" /></div>
                <div><label style={lbl}>Date (04 / 28)</label><input style={inp} value={gForm.date} onChange={e => G("date",e.target.value)} maxLength={2} placeholder="04" /></div>
                <div><label style={lbl}>Month (OCT / NOV)</label><input style={inp} value={gForm.month} onChange={e => G("month",e.target.value.toUpperCase())} maxLength={3} placeholder="OCT" /></div>
                <div><label style={lbl}>Time</label><input style={inp} value={gForm.time} onChange={e => G("time",e.target.value)} placeholder="9:00 AM WAT" /></div>
              </div>
              <div><label style={lbl}>Description</label><textarea style={ta} value={gForm.desc} onChange={e => G("desc",e.target.value)} placeholder="Brief summary of what believers will experience..." /></div>
              <div style={row3}>
                <div><label style={lbl}>Speaker / Minister</label><input style={inp} value={gForm.speaker} onChange={e => G("speaker",e.target.value)} placeholder="Rev. Joshua Agunbiade" /></div>
                <div><label style={lbl}>Scripture Reference</label><input style={inp} value={gForm.scripture} onChange={e => G("scripture",e.target.value)} placeholder="Numbers 23:21" /></div>
                <div><label style={lbl}>City / Location</label><input style={inp} value={gForm.city} onChange={e => G("city",e.target.value)} placeholder="Jos" /></div>
              </div>

              {/* Flier Image URL with Live Thumbnail Preview */}
              <div style={row2}>
                <div>
                  <label style={lbl}>Flier Image URL (Poster on homepage card)</label>
                  <input
                    style={inp}
                    value={gForm.flierUrl}
                    onChange={e => G("flierUrl", e.target.value)}
                    placeholder="https://i.postimg.cc/... or /images/..."
                  />
                  {gForm.flierUrl.trim() && (
                    <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"12px", backgroundColor:Paper100, padding:"8px 12px", borderRadius:"6px", border:`1px solid ${Paper300}` }}>
                      <img
                        src={gForm.flierUrl.trim()}
                        alt="Flier preview"
                        style={{ width:"54px", height:"54px", objectFit:"cover", borderRadius:"4px", border:`1px solid ${Paper200}` }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <div>
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600, color:Green }}>✓ Live Flier Preview</div>
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", color:Slate500, overflow:"hidden", textOverflow:"ellipsis", maxWidth:"280px", whiteSpace:"nowrap" }}>{gForm.flierUrl.trim()}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label style={lbl}>Display Order (1 = first card on left)</label>
                  <input type="number" style={inp} value={gForm.order} onChange={e => G("order",e.target.value)} min={-100} />
                  <div style={{ marginTop:"12px" }}>
                    <label style={lbl}>Registration URL (Optional)</label>
                    <input style={inp} value={gForm.registrationUrl || ""} onChange={e => G("registrationUrl",e.target.value)} placeholder="https://forms.gle/... (creates 'Register →' link)" />
                  </div>
                </div>
              </div>

              <label style={{ display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:Navy, cursor:"pointer" }}>
                <input type="checkbox" checked={gForm.published} onChange={e => G("published",e.target.checked)} />
                Show on homepage Next Gatherings section
              </label>

              <div style={{ display:"flex", gap:"12px" }}>
                <button type="submit" disabled={gLoading} style={{ ...btn(Blue700,White), opacity:gLoading?0.6:1 }}>
                  {gLoading ? "Saving..." : editId ? "Update Gathering" : "Add Gathering"}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setGForm({...EMPTY_G}); setEditId(null); }} style={btn(Paper200,Navy)}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Event Gallery Photos Manager ── */}
          <div style={{ ...card, marginBottom:"24px" }}>
            <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"16px", color:Navy, margin:"0 0 8px" }}>Event Gallery Photos</h2>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:"0 0 16px" }}>
              These photos show under the gatherings list on the homepage. Add image URLs (https://… or /images/…).
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {((settings.gatheringsImages as string[]) || ["/images/event-1.webp","/images/event-2.webp","/images/event-3.webp"]).map((url: string, i: number) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"56px 1fr auto", gap:"10px", alignItems:"center" }}>
                  <div style={{ width:"56px", height:"40px", borderRadius:"4px", backgroundImage:`url('${url}')`, backgroundSize:"cover", backgroundPosition:"center", border:`1px solid ${Paper300}`, flexShrink:0 }} />
                  <input style={inp} value={url}
                    onChange={e => {
                      const imgs = [...(settings.gatheringsImages || ["/images/event-1.webp","/images/event-2.webp","/images/event-3.webp"])];
                      imgs[i] = e.target.value;
                      S("gatheringsImages", imgs);
                    }}
                    placeholder="https://... or /images/..." />
                  <button onClick={() => {
                    const imgs = [...(settings.gatheringsImages || ["/images/event-1.webp","/images/event-2.webp","/images/event-3.webp"])];
                    imgs.splice(i, 1);
                    S("gatheringsImages", imgs);
                  }} style={btn("#FEE2E2",Red)}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"12px", marginTop:"14px" }}>
              <button type="button" onClick={() => {
                const imgs = [...((settings.gatheringsImages as string[]) || ["/images/event-1.webp","/images/event-2.webp","/images/event-3.webp"])];
                imgs.push("");
                S("gatheringsImages", imgs);
              }} style={btn(Paper200,Navy)}>+ Add Photo</button>
              <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Gallery Photos"}</button>
            </div>
          </div>

          {/* Current Gatherings List */}
          <div style={{ marginBottom:"20px" }}>
            <h3 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"14px", color:Slate500, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 12px" }}>
              Current Gatherings on Homepage ({gatherings.length})
            </h3>
            {gatherings.length===0 && (
              <p style={{ fontFamily:"'Poppins',sans-serif", color:Slate500, textAlign:"center", padding:"40px 0" }}>
                No gatherings yet. Add your first one above or import an event from /schedule.
              </p>
            )}
            {gatherings.map(g => (
              <div key={g.id} style={{ backgroundColor:White, border:`1px solid ${Paper300}`, borderRadius:"8px", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"16px", minWidth:0 }}>
                  <div style={{ textAlign:"center", minWidth:"50px", backgroundColor:Paper100, borderRadius:"4px", padding:"6px 8px", flexShrink:0 }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:Slate500 }}>{g.day}</div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"22px", fontWeight:700, color:Navy, lineHeight:1 }}>{g.date}</div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:Slate500 }}>{g.month}</div>
                  </div>

                  {g.flierUrl && (
                    <img
                      src={g.flierUrl}
                      alt={g.title}
                      style={{
                        width: "44px",
                        height: "44px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: `1px solid ${Paper200}`,
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  )}

                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"15px", color:Navy }}>
                        {g.title}
                      </span>
                      {g.eventId && (
                        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:700, color:Blue700, backgroundColor:"#EBF2FF", padding:"2px 6px", borderRadius:"4px", textTransform:"uppercase" }}>
                          From /schedule
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"3px" }}>
                      {g.time} · {g.city}{g.scripture ? ` · ${g.scripture}` : ""}
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
                  <span style={{ padding:"4px 10px", backgroundColor:g.published?"#DCFCE7":Paper200, color:g.published?Green:Slate500, borderRadius:"4px", fontFamily:"'Poppins',sans-serif", fontSize:"10px", fontWeight:600, textTransform:"uppercase" }}>
                    {g.published?"Showing":"Hidden"}
                  </span>
                  <button onClick={() => togglePublishG(g)} style={btn(Paper200,Navy)}>{g.published?"Hide":"Show"}</button>
                  <button onClick={() => editG(g)} style={btn(Paper200,Navy)}>Edit</button>
                  <button onClick={() => deleteG(g.id)} style={btn("#FEE2E2",Red)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ───── TEACHING TAB (5-SERMON CAROUSEL) ───── */}
      {tab==="teaching" && (
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px", marginBottom:"24px" }}>
            <div>
              <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:0 }}>
                The Latest Teaching (5-Sermon Carousel)
              </h2>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:"4px 0 0" }}>
                Displays the 5 most recent teachings in chronological order with unique overviews.
              </p>
            </div>

            {/* Mode Switcher */}
            <div style={{ display:"flex", gap:"6px", backgroundColor:Paper100, padding:"4px", borderRadius:"6px" }}>
              <button
                type="button"
                onClick={() => S("teachingMode", "auto")}
                style={{
                  ...btn((settings.teachingMode || "auto") === "auto" ? Blue700 : "transparent", (settings.teachingMode || "auto") === "auto" ? White : Navy),
                  padding:"6px 14px",
                  fontSize:"10px",
                }}
              >
                ⚡ Automatic (5 Most Recent)
              </button>
              <button
                type="button"
                onClick={() => S("teachingMode", "manual")}
                style={{
                  ...btn(settings.teachingMode === "manual" ? Blue700 : "transparent", settings.teachingMode === "manual" ? White : Navy),
                  padding:"6px 14px",
                  fontSize:"10px",
                }}
              >
                ✏️ Manual Overrides
              </button>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            {/* Section Headings */}
            <div style={row2}>
              {F("Section Eyebrow","teachingEyebrow","The Latest Teaching")}
              {F("Section Heading","teachingHeading","Published This Week")}
            </div>

            {(settings.teachingMode || "auto") === "auto" ? (
              /* Automatic Mode View */
              <div style={{ backgroundColor:Paper100, border:`1px solid ${Paper300}`, borderRadius:"8px", padding:"20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
                  <div>
                    <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"12px", color:Navy, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      Live 5 Carousel Slides (Auto-fetched from database)
                    </span>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, margin:"2px 0 0" }}>
                      Ranked from most recent to 5th most recent by publication / upload date.
                    </p>
                  </div>
                  <Link
                    href="/cms/sermons"
                    style={{
                      fontFamily:"'Poppins',sans-serif",
                      fontSize:"11px",
                      fontWeight:600,
                      color:Blue700,
                      textDecoration:"none",
                    }}
                  >
                    Edit Sermon Overviews in Sermons CMS →
                  </Link>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {liveSermons.map((s, idx) => {
                    const rankLabels = ["01 · Latest Release", "02 · 2nd Most Recent", "03 · 3rd Most Recent", "04 · 4th Most Recent", "05 · 5th Most Recent"];
                    return (
                      <div
                        key={s.id || idx}
                        style={{
                          backgroundColor:White,
                          border:`1px solid ${Paper200}`,
                          borderRadius:"6px",
                          padding:"12px 16px",
                          display:"grid",
                          gridTemplateColumns:"auto 1fr auto",
                          gap:"14px",
                          alignItems:"center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily:"'Poppins',sans-serif",
                            fontSize:"10px",
                            fontWeight:700,
                            padding:"3px 8px",
                            borderRadius:"12px",
                            backgroundColor:idx === 0 ? "#DCFCE7" : Paper200,
                            color:idx === 0 ? Green : Slate500,
                            textTransform:"uppercase",
                          }}
                        >
                          {rankLabels[idx]}
                        </span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"13.5px", color:Navy, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {s.title}
                          </div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"12px", color:Slate500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:"2px" }}>
                            {s.summary || "(No custom overview yet — using YouTube description)"}
                          </div>
                        </div>
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, whiteSpace:"nowrap" }}>
                          {s.duration || s.date || "—"}
                        </div>
                      </div>
                    );
                  })}
                  {liveSermons.length === 0 && (
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:0, textAlign:"center", padding:"16px 0" }}>
                      Loading live sermons preview...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Manual Mode Form */
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                <div style={{ padding:"12px 16px", backgroundColor:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:"6px" }}>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:"#92400E", margin:0, fontWeight:600 }}>
                    ⚠️ Manual Overrides Active: The fields below will override the primary teaching card.
                  </p>
                </div>
                {FRow([["Series Eyebrow (e.g. Foundations · Part 8)","teachingSeriesEyebrow","Foundations · Part Eight"],["Sermon Image URL","teachingImageUrl","/images/sermon-v2.webp"]])}
                {F("Sermon Title","teachingTitle","A Workman Unashamed")}
                {F("Description / Overview Synopsis","teachingDesc","",true)}
                {FRow([["Button 1 Label","teachingBtn1Label","Listen — 48:12"],["Button 1 URL","teachingBtn1Url","/resources"]])}
                {FRow([["Button 2 Label","teachingBtn2Label","Read the Transcript"],["Button 2 URL","teachingBtn2Url","/resources"]])}
                <div>
                  <label style={lbl}>Colophon (comma-separated — Scripture, Series, Speaker, City, Duration)</label>
                  <input style={inp} value={settings.teachingColophon??""} onChange={e => S("teachingColophon",e.target.value)} placeholder="2 Timothy 2:15,Foundations,Dr. Joshua Agunbiade,Jos,48:12" />
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"6px" }}>Separate each item with a comma. First item shows in blue.</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Teaching Section"}</button>
          </div>
        </div>
      )}

      {/* ───── ARTICLES CAROUSEL TAB ───── */}
      {tab==="articles" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 8px" }}>Articles Carousel — "From the Articles"</h2>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:"0 0 24px" }}>
            Controls the "Worth Reading" carousel on the homepage. The carousel automatically cycles through the most recent published articles. Use the fields below to edit the section labels or hide the section entirely.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:Navy, cursor:"pointer" }}>
              <input type="checkbox" checked={settings.articlesCarouselShow !== false} onChange={e => S("articlesCarouselShow", e.target.checked)} />
              Show "From the Articles" section on the homepage
            </label>
            {FRow([["Eyebrow Label","articlesCarouselEyebrow","From the Articles"],["Section Heading","articlesCarouselHeading","Worth Reading"]])}
            <div style={{ backgroundColor:Paper100, border:`1px solid ${Paper300}`, borderRadius:"8px", padding:"16px" }}>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"12px", color:Navy, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.1em" }}>How the carousel works</p>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:Slate500, margin:0, lineHeight:"1.6em" }}>
                Articles are automatically fetched from the Articles database, starting with the most recently published one, then cycling through the rest in random order. The newest article displays 2 seconds longer. To feature or exclude specific articles, edit them directly in the Articles CMS editor.
              </p>
            </div>
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Articles Section"}</button>
          </div>
        </div>
      )}

      {/* ───── WHO WE ARE TAB ───── */}
      {tab==="whoweare" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Who We Are Section</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {F("Eyebrow Text","whoEyebrow","Who We Are")}
            {F("Pull Quote / Epigraph","whoQuote","Every believer is commissioned...",true)}
            {F("Body Paragraph","whoBody","Established in 2020...",true)}
            {FRow([["Button Label","whoBtnLabel","Read What We Believe"],["Button URL","whoBtnUrl","/about"]])}
            {F("Background Image URL","whoBgImage","/images/who-we-are-v2.webp")}
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Who We Are Section"}</button>
          </div>
        </div>
      )}

      {/* ───── ANNOUNCEMENT TAB ───── */}
      {tab==="announcement" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Special Announcement Section</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:Navy, cursor:"pointer" }}>
              <input type="checkbox" checked={!!settings.annShow} onChange={e => S("annShow",e.target.checked)} />
              Show this section on homepage
            </label>
            {F("Section Heading","annHeading","Special Announcement")}
            {F("Sub-heading","annSubheading","We Are Building")}
            {F("Body Text","annBody","After five years...",true)}
            {F("Announcement Image URL","annImageUrl","https://...")}
            {FRow([["Button 1 Label","annBtn1Label","Give Now"],["Button 1 URL","annBtn1Url","https://..."]])}
            {FRow([["Button 2 Label","annBtn2Label","See More..."],["Button 2 URL","annBtn2Url","https://..."]])}
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Announcement Section"}</button>
          </div>
        </div>
      )}

      {/* ───── GIVING TAB ───── */}
      {tab==="giving" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Giving Section</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {FRow([["Eyebrow","givingEyebrow","Giving"],["Section Heading","givingHeading","Your Giving Publishes the Word"]])}
            {F("Body Text","givingBody","Gifts to this house...",true)}
            {FRow([["Button Label","givingBtnLabel","Give Now"],["Button URL","givingBtnUrl","/giving"]])}
            {F("Background Image URL","givingBgImage","/images/giving-bg.webp")}
            <div>
              <label style={lbl}>Giving Categories (comma-separated)</label>
              <input style={inp} value={settings.givingCategories??""} onChange={e => S("givingCategories",e.target.value)} placeholder="Tithe,Offering,Special Projects,Thanksgiving" />
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"6px" }}>These show as clickable grid buttons on the homepage. Each links to the giving page.</p>
            </div>
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Giving Section"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
