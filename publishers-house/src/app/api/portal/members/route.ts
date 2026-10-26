import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import type { PortalUser, UserRole } from "@/lib/portalAuth";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Resend email dispatcher ──────────────────────────────────────────────────
// The ADMIN_NOTIFY_EMAIL is the verified Resend account owner — always reachable.
// When the domain is not yet verified, we fall back to notifying this address
// with the new member's credentials so the admin can forward/share them.
const ADMIN_NOTIFY_EMAIL = "thepublishershouse007@gmail.com";

async function sendInvitationEmail(data: {
  displayName: string;
  email: string;
  tempPassword: string;
  role: string;
  siteUrl: string;
}): Promise<{ ok: boolean; sentTo: "member" | "admin" | "none"; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, sentTo: "none", error: "RESEND_API_KEY not set in environment" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "The Publishers House <noreply@thepublishershouse.org>";
  const memberHtml = buildInvitationEmailHtml(data);

  // ── Attempt 1: Send directly to the new member ──────────────────────────────
  try {
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      subject: "You're invited — The Publishers House Portal",
      html: memberHtml,
    });

    if (!error) {
      return { ok: true, sentTo: "member" };
    }

    console.warn("Direct member send failed:", error.message, "— falling back to admin notify.");
  } catch (err: any) {
    console.warn("Direct member send exception:", err?.message, "— falling back to admin notify.");
  }

  // ── Attempt 2: Notify the admin so they can forward credentials manually ────
  // This always works because ADMIN_NOTIFY_EMAIL is the verified Resend account.
  const adminHtml = buildAdminNotifyHtml(data);
  try {
    const { error: adminError } = await resend.emails.send({
      from,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `[Action Required] New portal account for ${data.displayName} — forward credentials`,
      html: adminHtml,
    });

    if (!adminError) {
      return {
        ok: true,
        sentTo: "admin",
        error: `Domain not yet verified — credentials sent to admin (${ADMIN_NOTIFY_EMAIL}) to forward.`,
      };
    }

    console.error("Admin fallback send also failed:", adminError.message);
    return { ok: false, sentTo: "none", error: adminError.message };
  } catch (err: any) {
    console.error("Admin fallback exception:", err?.message);
    return { ok: false, sentTo: "none", error: err?.message || "Both send attempts failed" };
  }
}

// ─── Admin fallback email (sent when domain not yet verified) ─────────────────
function buildAdminNotifyHtml(data: {
  displayName: string;
  email: string;
  tempPassword: string;
  role: string;
  siteUrl: string;
}): string {
  const loginUrl = `${data.siteUrl}/portal/login`;
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Portal Account — Forward Credentials</title></head>
<body style="margin:0;padding:0;background-color:#EEF1FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF1FA;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:580px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #D3DAEC;box-shadow:0 8px 32px rgba(21,26,84,0.10);">
        <tr><td style="background-color:#92400E;padding:4px 0;font-size:0;">&nbsp;</td></tr>
        <tr><td style="background-color:#151A54;padding:28px 40px;text-align:center;">
          <div style="font-size:10px;font-weight:700;letter-spacing:0.3em;color:#F59E0B;text-transform:uppercase;margin-bottom:8px;">The Publishers House · Admin Action Required</div>
          <div style="font-size:22px;font-weight:800;color:#FFFFFF;">New Portal Account Created</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;">Please forward credentials to the new member</div>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <div style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:4px;padding:12px 16px;margin-bottom:24px;">
            <strong style="font-size:13px;color:#92400E;">⚠️ Why are you receiving this?</strong>
            <p style="font-size:12.5px;color:#92400E;margin:6px 0 0;line-height:1.5;">
              The Publishers House domain is not yet verified with Resend, so invitation emails cannot be sent directly to new members yet.
              Please copy the credentials below and share them with <strong>${data.displayName}</strong> via WhatsApp, SMS, or personal email.
            </p>
          </div>

          <div style="background:#F4F6FB;border:1px solid #D3DAEC;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <div style="background:#151A54;padding:10px 20px;">
              <span style="font-size:10.5px;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:0.2em;">New Member Credentials to Forward</span>
            </div>
            <div style="padding:20px;">
              <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #E4ECF9;">
                <div style="font-size:11px;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Member Name</div>
                <div style="font-size:16px;font-weight:700;color:#151A54;">${data.displayName}</div>
              </div>
              <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #E4ECF9;">
                <div style="font-size:11px;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Role</div>
                <div style="font-size:14px;font-weight:600;color:#0140C1;">${data.role}</div>
              </div>
              <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #E4ECF9;">
                <div style="font-size:11px;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Login Email</div>
                <div style="font-size:15px;font-weight:700;color:#151A54;">${data.email}</div>
              </div>
              <div>
                <div style="font-size:11px;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Temporary Password (case-sensitive)</div>
                <span style="font-size:24px;font-weight:800;letter-spacing:0.12em;color:#0140C1;font-family:'Courier New',Courier,monospace;background:#FFFFFF;padding:10px 20px;border-radius:6px;border:2px dashed #2090FF;display:inline-block;">${data.tempPassword}</span>
              </div>
            </div>
          </div>

          <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
            <div style="font-size:12.5px;font-weight:700;color:#1E40AF;margin-bottom:6px;">📋 Message to copy and send to ${data.displayName}:</div>
            <div style="font-size:12px;color:#1E40AF;line-height:1.7;font-family:'Courier New',Courier,monospace;background:#DBEAFE;padding:12px;border-radius:4px;">
              Welcome to The Publishers House Portal!<br>
              You have been added as a <strong>${data.role}</strong>.<br><br>
              Sign-in Email: ${data.email}<br>
              Temporary Password: ${data.tempPassword}<br><br>
              Sign in at: ${loginUrl}<br>
              (You will be asked to change your password on first login.)
            </div>
          </div>

          <div style="text-align:center;">
            <a href="${loginUrl}" style="display:inline-block;background:#0140C1;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;padding:14px 36px;border-radius:8px;letter-spacing:0.06em;">
              View Portal Login Page →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#F4F6FB;padding:20px 40px;border-top:1px solid #D3DAEC;text-align:center;">
          <div style="font-size:12px;font-weight:700;color:#151A54;margin-bottom:4px;">The Publishers House</div>
          <div style="font-size:11px;color:#747CA1;">thepublishershouse.org · Psalm 68:11</div>
          <div style="font-size:10px;color:#B0BAD8;margin-top:8px;">
            To send emails directly to members, verify your domain at
            <a href="https://resend.com/domains" style="color:#0140C1;">resend.com/domains</a> · &copy; ${year}
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

// Standard TPH Super Admin & Portal Manager definitions
const SUPER_ADMIN_EMAIL = "joshuaagunbiade@gmail.com";
const PORTAL_MANAGER_EMAIL = "thepublishershouse007@gmail.com";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TPH-${random}`;
}

function buildInvitationEmailHtml(data: {
  displayName: string;
  email: string;
  tempPassword: string;
  role: string;
  siteUrl: string;
}): string {
  const loginUrl = `${data.siteUrl}/portal/login`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Publishers House Portal</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF1FA;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" style="max-width:580px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #D3DAEC;box-shadow:0 8px 32px rgba(21,26,84,0.10);">

          <!-- ── HEADER BANNER ── -->
          <tr>
            <td style="background-color:#151A54;padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Gold top accent line -->
                  <td style="background:linear-gradient(90deg,#D97706 0%,#F59E0B 50%,#D97706 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:36px 40px 28px;text-align:center;">
                    <!-- Wordmark -->
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.35em;color:#F59E0B;text-transform:uppercase;margin-bottom:12px;">
                      — PSALM 68:11 —
                    </div>
                    <div style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;line-height:1.15em;margin-bottom:6px;">
                      The Publishers House
                    </div>
                    <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.55);letter-spacing:0.06em;text-transform:uppercase;">
                      Portal Access — Member Invitation
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING ── -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="font-size:17px;font-weight:700;color:#151A54;margin:0 0 10px;">
                Grace and peace, <span style="color:#0140C1;">${data.displayName}</span>.
              </p>
              <p style="font-size:14.5px;line-height:1.7;color:#4A62A0;margin:0 0 28px;">
                Your <strong style="color:#151A54;">${data.role}</strong> account on The Publishers House Ministry Portal has been created. We are glad to have you on board.
              </p>
              <p style="font-size:14px;line-height:1.65;color:#4A62A0;margin:0 0 28px;">
                Use the credentials below to sign in for the first time. You will be asked to set your own private password immediately after.
              </p>
            </td>
          </tr>

          <!-- ── CREDENTIALS CARD ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6FB;border:1px solid #D3DAEC;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="background-color:#151A54;padding:10px 20px;">
                    <span style="font-size:10.5px;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:0.2em;">Your Sign-In Credentials</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:14px;border-bottom:1px solid #E4ECF9;">
                          <div style="font-size:11px;font-weight:600;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Email Address</div>
                          <div style="font-size:15px;font-weight:700;color:#151A54;">${data.email}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:14px;">
                          <div style="font-size:11px;font-weight:600;color:#747CA1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Temporary Password</div>
                          <div style="display:inline-block;">
                            <span style="font-size:22px;font-weight:800;letter-spacing:0.12em;color:#0140C1;font-family:'Courier New',Courier,monospace;background:#FFFFFF;padding:10px 18px;border-radius:6px;border:2px dashed #2090FF;display:inline-block;">${data.tempPassword}</span>
                          </div>
                          <div style="font-size:11.5px;color:#747CA1;margin-top:8px;">This is case-sensitive. Copy it exactly as shown.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SECURITY ALERT ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBEB;border-left:4px solid #D97706;border-radius:0 6px 6px 0;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="font-size:13px;font-weight:700;color:#92400E;margin:0 0 4px;">
                      🔐 Required: Change your password on first login
                    </p>
                    <p style="font-size:12.5px;color:#92400E;margin:0;line-height:1.5;font-weight:500;">
                      The portal will immediately prompt you to set a private password when you sign in. Your account cannot be accessed with the temporary password after this step.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA BUTTON ── -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#0140C1;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.08em;padding:16px 44px;border-radius:8px;text-transform:uppercase;box-shadow:0 4px 14px rgba(1,64,193,0.35);">
                Sign In to the Portal →
              </a>
              <div style="margin-top:14px;font-size:12px;color:#747CA1;">
                Or visit directly: <a href="${loginUrl}" style="color:#0140C1;text-decoration:none;font-weight:600;">${loginUrl}</a>
              </div>
            </td>
          </tr>

          <!-- ── DIVIDER & ENCOURAGEMENT ── -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4ECF9;">
                <tr>
                  <td style="padding-top:28px;">
                    <p style="font-size:14px;line-height:1.7;color:#4A62A0;margin:0 0 6px;">
                      <em>"The Lord gave the word: great was the company of those that published it."</em>
                    </p>
                    <p style="font-size:12px;color:#9CA6CC;margin:0;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Psalm 68:11</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#F4F6FB;padding:24px 40px;border-top:1px solid #D3DAEC;text-align:center;">
              <div style="font-size:13px;font-weight:800;color:#151A54;margin-bottom:4px;letter-spacing:0.02em;">The Publishers House</div>
              <div style="font-size:11.5px;color:#747CA1;line-height:1.6;">
                The House of Bread, Korinjoh House, British, Jos, Plateau State<br>
                West Africa · <a href="https://www.thepublishershouse.org" style="color:#0140C1;text-decoration:none;">thepublishershouse.org</a>
              </div>
              <div style="margin-top:10px;font-size:10.5px;color:#B0BAD8;">
                You received this email because an administrator created a portal account for you.<br>
                If you did not request this, please contact us at <a href="mailto:thepublishershouse007@gmail.com" style="color:#747CA1;">thepublishershouse007@gmail.com</a><br>
                &copy; ${year} The Publishers House. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`.trim();
}

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const usersSnap = await adminDb.collection("users").get();
    let members: PortalUser[] = [];

    usersSnap.forEach((doc) => {
      const d = doc.data();
      members.push({
        uid: doc.id,
        email: d.email || "",
        displayName: d.displayName || "Member",
        phone: d.phone || "",
        role: (d.role as UserRole) || "member",
        assignedUnitId: d.assignedUnitId || "",
        activityTier: d.activityTier || "regular",
        campus: d.campus || "jos",
        mustChangePassword: Boolean(d.mustChangePassword),
        tempPassword: d.tempPassword || undefined,
        hasAccount: Boolean(d.hasAccount || d.role === "admin" || d.role === "super_admin" || d.role === "portal_manager"),
        createdAt: d.createdAt || new Date().toISOString(),
        lastLogin: d.lastLogin || "",
        photoURL: d.photoURL || undefined,
      });
    });

    // Auto-seed Reverend Joshua Agunbiade as Super Admin if not already present
    const hasJoshua = members.some((m) => m.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (!hasJoshua) {
      const joshuaDoc = {
        uid: "user-super-admin-joshua",
        email: SUPER_ADMIN_EMAIL,
        displayName: "Rev. Joshua Agunbiade",
        phone: "+234 813 063 5386",
        role: "super_admin" as UserRole,
        assignedUnitId: "pastoral",
        activityTier: "leader" as const,
        campus: "jos" as const,
        hasAccount: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await adminDb.collection("users").doc(joshuaDoc.uid).set(joshuaDoc);
      members.unshift(joshuaDoc);
    } else {
      // Ensure role is super_admin
      const j = members.find((m) => m.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      if (j && j.role !== "super_admin") {
        j.role = "super_admin";
        await adminDb.collection("users").doc(j.uid).update({ role: "super_admin", phone: "+234 813 063 5386" });
      }
    }

    // Auto-seed Publisher 007 as Portal Manager if not already present
    const has007 = members.some((m) => m.email.toLowerCase() === PORTAL_MANAGER_EMAIL.toLowerCase());
    if (!has007) {
      const manager007 = {
        uid: "user-portal-manager-007",
        email: PORTAL_MANAGER_EMAIL,
        displayName: "Publisher 007",
        phone: "+234 8116643403",
        role: "portal_manager" as UserRole,
        assignedUnitId: "media_technical",
        activityTier: "leader" as const,
        campus: "jos" as const,
        hasAccount: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await adminDb.collection("users").doc(manager007.uid).set(manager007);
      members.push(manager007);
    }

    return NextResponse.json({ ok: true, members });
  } catch (err: any) {
    console.error("Error fetching members:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const body = await req.json();
    const { action } = body;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thepublishershouse.org";

    // 1. CREATE ACCOUNT FOR MEMBER (With Temp Password & Branded Invitation)
    if (action === "create_account") {
      const { uid, email, displayName, role, assignedUnitId, phone, campus, activityTier } = body;
      if (!email) {
        return NextResponse.json({ error: "Email is required to create an account" }, { status: 400 });
      }

      const tempPassword = body.tempPassword || generateTempPassword();
      const targetRole: UserRole = role || "member";
      let authUid = uid;

      // Create or update user in Firebase Auth
      try {
        const existingAuth = await adminAuth.getUserByEmail(email);
        authUid = existingAuth.uid;
        await adminAuth.updateUser(authUid, {
          password: tempPassword,
          displayName: displayName || undefined,
        });
      } catch (authErr: any) {
        if (authErr.code === "auth/user-not-found") {
          const newAuth = await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName: displayName || "Member",
            phoneNumber: phone && phone.startsWith("+") ? phone : undefined,
          });
          authUid = newAuth.uid;
        } else {
          throw authErr;
        }
      }

      // Save / update in Firestore
      const userDocData: PortalUser = {
        uid: authUid,
        email,
        displayName: displayName || email.split("@")[0],
        phone: phone || "",
        role: targetRole,
        assignedUnitId: assignedUnitId || "",
        activityTier: activityTier || "regular",
        campus: campus || "jos",
        mustChangePassword: true,
        tempPassword,
        hasAccount: true,
        createdAt: new Date().toISOString(),
        lastLogin: "",
      };

      await adminDb.collection("users").doc(authUid).set(userDocData, { merge: true });

      // Build the role label for the email
      const roleLabel =
        targetRole === "unit_head" ? "Unit Head" :
        targetRole === "admin" ? "Administrator" :
        targetRole === "portal_manager" ? "Portal Manager" :
        targetRole === "super_admin" ? "Senior Pastor" :
        "Member";

      // Dispatch branded invitation email automatically via Resend
      const emailResult = await sendInvitationEmail({
        displayName: userDocData.displayName,
        email,
        tempPassword,
        role: roleLabel,
        siteUrl,
      });

      const emailHtml = buildInvitationEmailHtml({
        displayName: userDocData.displayName,
        email,
        tempPassword,
        role: roleLabel,
        siteUrl,
      });

      return NextResponse.json({
        ok: true,
        user: userDocData,
        tempPassword,
        emailHtml,
        emailSent: emailResult.ok,
        emailSentTo: emailResult.sentTo,
        emailError: emailResult.error || null,
        message: emailResult.sentTo === "admin"
          ? `Credentials forwarded to admin (${ADMIN_NOTIFY_EMAIL}) because domain is not yet verified on Resend. Please forward to ${email}.`
          : emailResult.ok
          ? `Account created and invitation email sent to ${email}. Temporary password: ${tempPassword}`
          : `Account created for ${email}. Temporary password: ${tempPassword}. Email could not be sent: ${emailResult.error}`,
      });
    }

    // 2. ADD MEMBER TO DIRECTORY
    if (action === "add_member") {
      const { displayName, email, phone, role, assignedUnitId, activityTier, campus, createAuthImmediately } = body;
      if (!displayName) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      let uid = `member-${Date.now()}`;
      let tempPassword: string | undefined = undefined;
      let emailHtml: string | undefined = undefined;
      let emailSent = false;
      let emailSentTo: "member" | "admin" | "none" = "none";
      let emailError: string | null = null;

      if (createAuthImmediately && email) {
        tempPassword = generateTempPassword();
        try {
          const authUser = await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName,
          });
          uid = authUser.uid;
        } catch (e: any) {
          if (e.code === "auth/email-already-exists") {
            const ex = await adminAuth.getUserByEmail(email);
            uid = ex.uid;
          }
        }

        const roleLabel =
          role === "unit_head" ? "Unit Head" :
          role === "admin" ? "Administrator" :
          role === "portal_manager" ? "Portal Manager" :
          "Member";

        // Dispatch the branded email immediately
        const emailResult = await sendInvitationEmail({
          displayName,
          email,
          tempPassword,
          role: roleLabel,
          siteUrl,
        });

        emailSent = emailResult.ok;
        emailSentTo = emailResult.sentTo;
        emailError = emailResult.error || null;

        emailHtml = buildInvitationEmailHtml({
          displayName,
          email,
          tempPassword,
          role: roleLabel,
          siteUrl,
        });

      }

      const newMember: PortalUser = {
        uid,
        displayName,
        email: email || "",
        phone: phone || "",
        role: role || "member",
        assignedUnitId: assignedUnitId || "",
        activityTier: activityTier || "regular",
        campus: campus || "jos",
        mustChangePassword: Boolean(createAuthImmediately),
        tempPassword,
        hasAccount: Boolean(createAuthImmediately),
        createdAt: new Date().toISOString(),
        lastLogin: "",
      };

      await adminDb.collection("users").doc(uid).set(newMember, { merge: true });

      return NextResponse.json({
        ok: true,
        member: newMember,
        tempPassword,
        emailHtml,
        emailSent,
        emailSentTo,
        emailError,
        message: emailSentTo === "admin"
          ? `Member added and credentials forwarded to admin (${ADMIN_NOTIFY_EMAIL}).`
          : "Member added successfully",
      });
    }

    // 3. UPDATE MEMBER (Editable Email, Name, Phone, Unit, Role)
    if (action === "update_member") {
      const { uid, displayName, email, phone, role, assignedUnitId, activityTier, campus } = body;
      if (!uid) {
        return NextResponse.json({ error: "Member UID is required" }, { status: 400 });
      }

      const updates: any = {
        displayName: displayName || "",
        email: email || "",
        phone: phone || "",
        role: role || "member",
        assignedUnitId: assignedUnitId || "",
        activityTier: activityTier || "regular",
        campus: campus || "jos",
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection("users").doc(uid).set(updates, { merge: true });

      // If email or displayName changed, also update Firebase Auth if auth user exists
      if (email || displayName) {
        try {
          await adminAuth.updateUser(uid, {
            email: email || undefined,
            displayName: displayName || undefined,
          });
        } catch {
          // User might only exist in Firestore
        }
      }

      return NextResponse.json({ ok: true, updates });
    }

    // 4. ASSIGN OR REMOVE FROM UNIT
    if (action === "assign_unit") {
      const { uid, assignedUnitId } = body;
      if (!uid) return NextResponse.json({ error: "UID required" }, { status: 400 });

      await adminDb.collection("users").doc(uid).update({
        assignedUnitId: assignedUnitId || "",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, assignedUnitId });
    }

    // 5. DELETE MEMBER
    if (action === "delete_member") {
      const { uid } = body;
      if (!uid) return NextResponse.json({ error: "UID required" }, { status: 400 });

      await adminDb.collection("users").doc(uid).delete();
      try {
        await adminAuth.deleteUser(uid);
      } catch {
        // user may not be in Auth
      }
      return NextResponse.json({ ok: true, deleted: uid });
    }

    // 6. PASSWORD CHANGED
    if (action === "password_changed") {
      const { uid, newPassword } = body;
      if (uid) {
        if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
          try {
            await adminAuth.updateUser(uid, { password: newPassword });
          } catch (authErr) {
            console.error("Failed to update password in Firebase Auth:", authErr);
          }
        }
        await adminDb.collection("users").doc(uid).set(
          {
            mustChangePassword: false,
            tempPassword: null,
            passwordChangedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      return NextResponse.json({ ok: true, message: "Password updated successfully" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error in members API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
