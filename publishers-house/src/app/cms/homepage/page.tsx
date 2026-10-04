"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc, setDoc } from "firebase/firestore";
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

const TABS = ["hero","setman","gatherings","teaching","whoweare","announcement","giving"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = { hero:"Hero", setman:"Welcome", gatherings:"This Week", teaching:"Latest Teaching", whoweare:"Who We Are", announcement:"Announcement", giving:"Giving" };

const EMPTY_G = { day:"", date:"", month:"", title:"", desc:"", scripture:"", time:"", city:"Jos", theme:"", speaker:"Rev. Joshua Agunbiade", flierUrl:"", order:0, published:true };

const DEF: Record<string, string|boolean> = {
  heroEyebrow:"Psalm 68:11", heroHeadline:"Company of the Great",
  heroSubtitle:"An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
  heroBtn1Label:"Plan Your Visit", heroBtn1Url:"/about",
  heroBtn2Label:"Watch the Last Teaching", heroBtn2Url:"/resources",
  heroSundayLabel:"Sunday Worship", heroSundayTime:"9:00 AM",
  heroMidweekLabel:"Midweek Service", heroMidweekTime:"5:00 PM",
  heroAddress:"The House of Bread, Korinjoh House, British, Jos · West Africa Time",
  heroBgImage:"/images/hero-v2.jpg",
  setmanHeading:"Welcome Message\nfrom the Setman",
  setmanSubtext:"What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  setmanBtnLabel:"Read More About Us", setmanBtnUrl:"/about",
  setmanPhotoUrl:"/images/rja-setman.jpg",
  gatheringsLabel:"Next Gatherings", gatheringsHeading:"This Week at the House",
  teachingEyebrow:"The Latest Teaching", teachingHeading:"Published This Week",
  teachingSeriesEyebrow:"Foundations · Part Eight", teachingTitle:"A Workman Unashamed",
  teachingDesc:"What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  teachingBtn1Label:"Listen — 48:12", teachingBtn1Url:"/resources",
  teachingBtn2Label:"Read the Transcript", teachingBtn2Url:"/resources",
  teachingColophon:"2 Timothy 2:15,Foundations,Dr. Joshua Agunbiade,Jos,48:12",
  teachingImageUrl:"/images/sermon-v2.jpg",
  whoEyebrow:"Who We Are",
  whoQuote:"Every believer is commissioned to become a publisher of God's message.",
  whoBody:"Established in 2020 under the leadership of Dr. Joshua Agunbiade, the ministry exists to equip believers, strengthen the Church and advance the Kingdom through biblical teaching, revival and apologetics.",
  whoBtnLabel:"Read What We Believe", whoBtnUrl:"/about",
  whoBgImage:"/images/who-we-are-v2.jpg",
  annShow:true, annHeading:"Special Announcement",
  annSubheading:"We Are Building",
  annBody:"After five years of meeting in rented spaces, we have successfully acquired land for a permanent ministry home.",
  annBtn1Label:"Give Now", annBtn1Url:"https://forms.gle/4Gimdh1WcUerMQvVA",
  annBtn2Label:"See More on Our Building Project", annBtn2Url:"https://forms.gle/4Gimdh1WcUerMQvVA",
  annImageUrl:"/images/9528ca88db079ef5fecf726b4f42a332798a6fcc.jpg",
  givingEyebrow:"Giving", givingHeading:"Your Giving Publishes the Word",
  givingBody:"Gifts to this house pay for the gatherings, the recording and transcription of every teaching, and the programmes that carry the Word beyond Jos.",
  givingBtnLabel:"Give Now", givingBtnUrl:"/giving",
  givingBgImage:"/images/giving-bg.jpg",
  givingCategories:"Tithe,Offering,Special Projects,Thanksgiving",
};

export default function HomepageEditor() {
  const [tab, setTab] = useState<Tab>("gatherings");
  const [settings, setSettings] = useState<any>({ ...DEF });
  const [gatherings, setGatherings] = useState<any[]>([]);
  const [gForm, setGForm] = useState({ ...EMPTY_G });
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };
  const S = (k: string, v: any) => setSettings((s: any) => ({ ...s, [k]: v }));
  const G = (k: string, v: any) => setGForm((f) => ({ ...f, [k]: v }));

  const fetchSettings = async () => {
    const snap = await getDoc(doc(db, "homeSettings", "main"));
    if (snap.exists()) setSettings((p: any) => ({ ...DEF, ...p, ...snap.data() }));
  };
  const fetchGatherings = async () => {
    const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order","asc")));
    setGatherings(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  };

  useEffect(() => { fetchSettings(); fetchGatherings(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db,"homeSettings","main"), settings, { merge:true });
      flash("Saved ✓ — changes will appear on the homepage shortly.");
    } catch(e: any) { flash("Error: "+e.message); }
    setSaving(false);
  };

  const saveGathering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gForm.title.trim()) { flash("Title is required"); return; }
    setGLoading(true);
    try {
      if (editId) {
        await updateDoc(doc(db,"gatherings",editId), { ...gForm, order:Number(gForm.order) });
        flash("Gathering updated ✓");
      } else {
        await addDoc(collection(db,"gatherings"), { ...gForm, order:Number(gForm.order), createdAt:new Date() });
        flash("Gathering added ✓");
      }
      setGForm({ ...EMPTY_G }); setEditId(null); fetchGatherings();
    } catch(e: any) { flash("Error: "+e.message); }
    setGLoading(false);
  };

  const deleteG = async (id: string) => { if (!confirm("Delete this gathering?")) return; await deleteDoc(doc(db,"gatherings",id)); fetchGatherings(); };
  const togglePublishG = async (g: any) => { await updateDoc(doc(db,"gatherings",g.id), { published:!g.published }); fetchGatherings(); };
  const editG = (g: any) => { setGForm({ ...EMPTY_G, ...g }); setEditId(g.id); window.scrollTo({ top:0, behavior:"smooth" }); };

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
            {FRow([["Scripture Eyebrow","heroEyebrow","Psalm 68:11"],["Hero Background Image URL","heroBgImage","/images/hero-v2.jpg"]])}
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
          {/* Section headings */}
          <div style={{ ...card, marginBottom:"8px" }}>
            <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"16px", color:Navy, margin:"0 0 16px" }}>Section Labels</h2>
            <div style={row2}>
              {F("Eyebrow Label","gatheringsLabel","Next Gatherings")}
              {F("Section Heading","gatheringsHeading","This Week at the House")}
            </div>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), marginTop:"16px", opacity:saving?0.6:1 }}>Save Labels</button>
          </div>

          {/* Add/Edit form */}
          <div style={card}>
            <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>{editId?"Edit Gathering":"Add New Gathering"}</h2>
            <form onSubmit={saveGathering} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={row2}>
                <div><label style={lbl}>Event Title *</label><input style={inp} value={gForm.title} onChange={e => G("title",e.target.value)} placeholder="e.g. The Time of the Word" required /></div>
                <div><label style={lbl}>Theme / Series</label><input style={inp} value={gForm.theme} onChange={e => G("theme",e.target.value)} placeholder="e.g. Part 6" /></div>
              </div>
              <div style={row4}>
                <div><label style={lbl}>Day (SUN)</label><input style={inp} value={gForm.day} onChange={e => G("day",e.target.value.toUpperCase())} maxLength={3} /></div>
                <div><label style={lbl}>Date (04)</label><input style={inp} value={gForm.date} onChange={e => G("date",e.target.value)} maxLength={2} /></div>
                <div><label style={lbl}>Month (OCT)</label><input style={inp} value={gForm.month} onChange={e => G("month",e.target.value.toUpperCase())} maxLength={3} /></div>
                <div><label style={lbl}>Time</label><input style={inp} value={gForm.time} onChange={e => G("time",e.target.value)} placeholder="9:00 AM" /></div>
              </div>
              <div><label style={lbl}>Description</label><textarea style={ta} value={gForm.desc} onChange={e => G("desc",e.target.value)} /></div>
              <div style={row3}>
                <div><label style={lbl}>Speaker</label><input style={inp} value={gForm.speaker} onChange={e => G("speaker",e.target.value)} /></div>
                <div><label style={lbl}>Scripture</label><input style={inp} value={gForm.scripture} onChange={e => G("scripture",e.target.value)} placeholder="Isaiah 59:1" /></div>
                <div><label style={lbl}>City</label><input style={inp} value={gForm.city} onChange={e => G("city",e.target.value)} /></div>
              </div>
              <div style={row2}>
                <div><label style={lbl}>Flier Image URL</label><input style={inp} value={gForm.flierUrl} onChange={e => G("flierUrl",e.target.value)} placeholder="https://..." /></div>
                <div><label style={lbl}>Display Order (1 = first)</label><input type="number" style={inp} value={gForm.order} onChange={e => G("order",e.target.value)} min={0} /></div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:Navy, cursor:"pointer" }}>
                <input type="checkbox" checked={gForm.published} onChange={e => G("published",e.target.checked)} />
                Show on homepage
              </label>
              <div style={{ display:"flex", gap:"12px" }}>
                <button type="submit" disabled={gLoading} style={{ ...btn(Blue700,White), opacity:gLoading?0.6:1 }}>{gLoading?"Saving...":editId?"Update Gathering":"Add Gathering"}</button>
                {editId && <button type="button" onClick={() => { setGForm({...EMPTY_G}); setEditId(null); }} style={btn(Paper200,Navy)}>Cancel</button>}
              </div>
            </form>
          </div>

          {/* Gatherings list */}
          <h3 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"14px", color:Slate500, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 12px" }}>Current Gatherings ({gatherings.length})</h3>
          {gatherings.length===0 && <p style={{ fontFamily:"'Poppins',sans-serif", color:Slate500, textAlign:"center", padding:"40px 0" }}>No gatherings yet. Add your first one above.</p>}
          {gatherings.map(g => (
            <div key={g.id} style={{ backgroundColor:White, border:`1px solid ${Paper300}`, borderRadius:"8px", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ textAlign:"center", minWidth:"50px", backgroundColor:Paper100, borderRadius:"4px", padding:"6px 8px" }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:Slate500 }}>{g.day}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"22px", fontWeight:700, color:Navy, lineHeight:1 }}>{g.date}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:Slate500 }}>{g.month}</div>
                </div>
                <div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"15px", color:Navy }}>{g.title}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"3px" }}>{g.time} · {g.city}{g.scripture ? ` · ${g.scripture}` : ""}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
                <span style={{ padding:"4px 10px", backgroundColor:g.published?"#DCFCE7":Paper200, color:g.published?Green:Slate500, borderRadius:"4px", fontFamily:"'Poppins',sans-serif", fontSize:"10px", fontWeight:600, textTransform:"uppercase" }}>{g.published?"Showing":"Hidden"}</span>
                <button onClick={() => togglePublishG(g)} style={btn(Paper200,Navy)}>{g.published?"Hide":"Show"}</button>
                <button onClick={() => editG(g)} style={btn(Paper200,Navy)}>Edit</button>
                <button onClick={() => deleteG(g.id)} style={btn("#FEE2E2",Red)}>Delete</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ───── TEACHING TAB ───── */}
      {tab==="teaching" && (
        <div style={card}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"18px", color:Navy, margin:"0 0 24px" }}>Latest Teaching Section</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {FRow([["Section Eyebrow","teachingEyebrow"],["Section Heading","teachingHeading"]])}
            {FRow([["Series Eyebrow (e.g. Foundations · Part 8)","teachingSeriesEyebrow","Foundations · Part Eight"],["Sermon Image URL","teachingImageUrl","/images/sermon-v2.jpg"]])}
            {F("Sermon Title","teachingTitle","A Workman Unashamed")}
            {F("Description","teachingDesc","",true)}
            {FRow([["Button 1 Label","teachingBtn1Label","Listen — 48:12"],["Button 1 URL","teachingBtn1Url","/resources"]])}
            {FRow([["Button 2 Label","teachingBtn2Label","Read the Transcript"],["Button 2 URL","teachingBtn2Url","/resources"]])}
            <div>
              <label style={lbl}>Colophon (comma-separated — Scripture, Series, Speaker, City, Duration)</label>
              <input style={inp} value={settings.teachingColophon??""} onChange={e => S("teachingColophon",e.target.value)} placeholder="2 Timothy 2:15,Foundations,Dr. Joshua Agunbiade,Jos,48:12" />
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:Slate500, marginTop:"6px" }}>Separate each item with a comma. First item shows in blue.</p>
            </div>
          </div>
          <div style={{ marginTop:"24px" }}>
            <button onClick={saveSettings} disabled={saving} style={{ ...btn(Blue700,White), opacity:saving?0.6:1 }}>{saving?"Saving...":"Save Teaching Section"}</button>
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
            {F("Background Image URL","whoBgImage","/images/who-we-are-v2.jpg")}
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
            {F("Background Image URL","givingBgImage","/images/giving-bg.jpg")}
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
