export const runtime = "nodejs"; // avoid Edge (Buffer/env issues)
export const dynamic = "force-dynamic"; // don't cache

import { NextRequest, NextResponse } from "next/server";

// Import Buffer explicitly so TS never complains
import { Buffer } from "node:buffer";

// Resend is optional in dev: if not installed or no key, we just skip send.
let Resend: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Resend = require("resend").Resend;
} catch {
  // no-op
}

const resend =
  process.env.RESEND_API_KEY && Resend
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      hasKey: !!process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM || null,
      to: process.env.RESEND_TO || null,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Use Blob instead of File for widest compatibility
    const blob = form.get("image") as unknown as Blob | null;

    const surfaceType = String(form.get("surfaceType") ?? "");
    const surfaceOther = String(form.get("surfaceOther") ?? "");
    const height = String(form.get("height") ?? "");
    const width = String(form.get("width") ?? "");
    const color = String(form.get("color") ?? "");
    const colorName = String(form.get("colorName") ?? "");
    const notes = String(form.get("notes") ?? "");
    const name = String(form.get("name") ?? "");
    const phone = String(form.get("phone") ?? "");
    const email = String(form.get("email") ?? "");

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone and email are required." },
        { status: 400 }
      );
    }

    const html = `
<h2>New Custom Mural Request</h2>
<table style="border-collapse:collapse">
<tr><td><b>Name</b></td><td>${name}</td></tr>
<tr><td><b>Phone</b></td><td>${phone}</td></tr>
<tr><td><b>Email</b></td><td>${email}</td></tr>
<tr><td><b>Surface</b></td><td>${surfaceType}${surfaceType === "Other" && surfaceOther ? " - " + surfaceOther : ""}</td></tr>
<tr><td><b>Size</b></td><td>${height || "?"} ft × ${width || "?"} ft</td></tr>
<tr><td><b>Color</b></td><td>${colorName || color || "—"}</td></tr>
<tr><td><b>Notes</b></td><td>${notes || "—"}</td></tr>
</table>
`;

    // Attachment (optional)
    const attachments: { filename: string; content: Buffer }[] = [];
    if (blob && "arrayBuffer" in blob) {
      const ab = await (blob as Blob).arrayBuffer();
      attachments.push({
        filename: (form.get("image") as any)?.name || "upload",
        content: Buffer.from(ab),
      });
    }

    if (resend) {
      const toList = (process.env.RESEND_TO || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!toList.length) {
        return NextResponse.json(
          { error: "Server missing RESEND_TO list." },
          { status: 500 }
        );
      }

      const from =
        process.env.RESEND_FROM || "Mural 3D <onboarding@resend.dev>";

      const result = await resend.emails.send({
        from,
        to: toList,
        subject: "New Custom Mural Request",
        html,
        attachments,
      });

      if (result?.error) {
        return NextResponse.json(
          { error: result.error.message || "Failed to send email." },
          { status: 502 }
        );
      }
    } else {
      // Dev fallback: log and succeed
      console.log("[DEV] No Resend — skipping email send.");
      console.log({
        name,
        phone,
        email,
        surfaceType,
        height,
        width,
        colorName: colorName || color,
        hasFile: !!blob,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("API /api/custom error:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
