import fs from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
if (!getApps().length) initializeApp({ credential: cert(json) });
const db = getFirestore();

async function main() {
  console.log("1. Updating Pastor Ngbede Odeh to admin role...");
  // Look for doc with email odehngbes@gmail.com
  const odehSnap = await db.collection("users").where("email", "==", "odehngbes@gmail.com").get();
  if (!odehSnap.empty) {
    for (const d of odehSnap.docs) {
      console.log(`Updating doc ${d.id} for Ngbede Odeh`);
      await db.collection("users").doc(d.id).set({
        displayName: "Pastor Ngbede Odeh",
        email: "odehngbes@gmail.com",
        phone: "+234 8186335861",
        role: "admin",
        assignedUnitId: "editorial",
        activityTier: "leader",
        campus: "jos",
        hasAccount: true,
      }, { merge: true });
    }
  } else {
    console.log("Creating doc for Ngbede Odeh");
    await db.collection("users").doc("pastor-ngbede-odeh").set({
      displayName: "Pastor Ngbede Odeh",
      email: "odehngbes@gmail.com",
      phone: "+234 8186335861",
      role: "admin",
      assignedUnitId: "editorial",
      activityTier: "leader",
      campus: "jos",
      hasAccount: true,
      createdAt: new Date().toISOString(),
    });
  }

  console.log("2. Adding / Updating Pastor Onah Boniface as admin...");
  const onahSnap = await db.collection("users").where("email", "==", "onahboniface9@gmail.com").get();
  if (!onahSnap.empty) {
    for (const d of onahSnap.docs) {
      console.log(`Updating doc ${d.id} for Onah Boniface`);
      await db.collection("users").doc(d.id).set({
        displayName: "Pastor Onah Boniface",
        email: "onahboniface9@gmail.com",
        phone: "+234 8179574795",
        role: "admin",
        assignedUnitId: "pastoral",
        activityTier: "leader",
        campus: "jos",
        hasAccount: true,
      }, { merge: true });
    }
  } else {
    console.log("Creating doc for Pastor Onah Boniface");
    await db.collection("users").doc("pastor-onah-boniface").set({
      displayName: "Pastor Onah Boniface",
      email: "onahboniface9@gmail.com",
      phone: "+234 8179574795",
      role: "admin",
      assignedUnitId: "pastoral",
      activityTier: "leader",
      campus: "jos",
      hasAccount: true,
      createdAt: new Date().toISOString(),
    });
  }

  console.log("3. Removing duplicate Joshua Agunbiade doc 'user-super-admin-joshua'...");
  const dupDoc = await db.collection("users").doc("user-super-admin-joshua").get();
  if (dupDoc.exists) {
    console.log("Found duplicate doc 'user-super-admin-joshua', deleting it...");
    await db.collection("users").doc("user-super-admin-joshua").delete();
    console.log("Deleted duplicate 'user-super-admin-joshua'");
  }

  // Ensure canonical Joshua Agunbiade doc has proper phone and role
  const canonicalJoshuaSnap = await db.collection("users").where("email", "==", "joshuaagunbiade@gmail.com").get();
  for (const d of canonicalJoshuaSnap.docs) {
    console.log(`Ensuring super_admin role on doc ${d.id}`);
    await db.collection("users").doc(d.id).set({
      displayName: "Rev. Joshua Agunbiade",
      role: "super_admin",
      phone: "+234 813 063 5386",
      activityTier: "leader",
      campus: "jos",
      hasAccount: true,
    }, { merge: true });
  }

  console.log("Finished updating pastors and deduplication!");
}

main().catch(console.error);
