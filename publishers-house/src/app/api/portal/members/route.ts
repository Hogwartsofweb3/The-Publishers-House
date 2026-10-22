import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import type { PortalUser, UserRole } from "@/lib/portalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your TPH Portal Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#151A54;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6FB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" maxWidth="560" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #D3DAEC;box-shadow:0 4px 20px rgba(21,26,84,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#151A54;padding:32px 36px;text-align:center;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.25em;color:#D97706;text-transform:uppercase;margin-bottom:8px;">The Publishers House</div>
              <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.02em;">Welcome to the Portal</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px;">
              <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#151A54;">
                Dear <strong>${data.displayName}</strong>,
              </p>
              <p style="font-size:14.5px;line-height:1.65;color:#4A62A0;margin:0 0 24px;">
                You have been invited to The Publishers House Administration Portal as a <strong>${data.role}</strong>. Your personal account has been created and is ready for use.
              </p>

              <!-- Credentials Card -->
              <div style="background-color:#F4F6FB;border:1px solid #D3DAEC;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="font-size:11px;font-weight:700;color:#747CA1;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:12px;">Your Sign-In Credentials</div>
                <div style="margin-bottom:10px;">
                  <span style="font-size:12px;color:#747CA1;">Email:</span>
                  <div style="font-size:14px;font-weight:600;color:#151A54;">${data.email}</div>
                </div>
                <div>
                  <span style="font-size:12px;color:#747CA1;">Temporary Password:</span>
                  <div style="font-size:18px;font-weight:800;letter-spacing:0.05em;color:#0140C1;font-family:monospace;background:#FFFFFF;padding:8px 12px;border-radius:4px;display:inline-block;border:1px dashed #2090FF;margin-top:4px;">
                    ${data.tempPassword}
                  </div>
                </div>
              </div>

              <!-- Warning Alert -->
              <div style="background-color:#FEF3C7;border-left:4px solid #D97706;padding:14px 16px;border-radius:4px;margin-bottom:28px;">
                <p style="font-size:13px;line-height:1.5;color:#92400E;margin:0;font-weight:600;">
                  ⚠️ Required Step: For security, you will be prompted to change your temporary password immediately upon your first sign in.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#0140C1;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;padding:14px 32px;border-radius:6px;text-transform:uppercase;">
                  Sign In to Your Account →
                </a>
              </div>

              <p style="font-size:12px;color:#747CA1;text-align:center;margin:0;">
                Or sign in via Google using your registered email address: <strong>${data.email}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F4F6FB;padding:24px 36px;border-top:1px solid #D3DAEC;text-align:center;">
              <div style="font-size:12px;font-weight:700;color:#151A54;margin-bottom:4px;">The Publishers House</div>
              <div style="font-size:11px;color:#747CA1;line-height:1.5;">
                The House of Bread, Korinjoh House, British, Jos · West Africa<br/>
                Psalm 68:11 · Company of the Great
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
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

      // Generate HTML email invitation
      const emailHtml = buildInvitationEmailHtml({
        displayName: userDocData.displayName,
        email,
        tempPassword,
        role: targetRole === "unit_head" ? "Unit Head" : targetRole === "admin" ? "Administrator" : "Member",
        siteUrl,
      });

      return NextResponse.json({
        ok: true,
        user: userDocData,
        tempPassword,
        emailHtml,
        message: `Account created for ${email}. Temporary password: ${tempPassword}`,
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

        emailHtml = buildInvitationEmailHtml({
          displayName,
          email,
          tempPassword,
          role: role === "unit_head" ? "Unit Head" : role === "admin" ? "Administrator" : "Member",
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
        message: "Member added successfully",
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
