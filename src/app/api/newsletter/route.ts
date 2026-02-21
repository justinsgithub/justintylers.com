import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    await resend.emails.send({
      from: "Justin Tyler <hello@mail.justintylers.com>",
      to: email,
      subject: "Welcome to the newsletter",
      html: `
        <p>Hey, thanks for subscribing.</p>
        <p>I write about health, software, AI, and whatever else I'm learning along the way. No set schedule, just when I have something worth sharing.</p>
        <p>If you ever want to reach me directly, just reply to this email.</p>
        <p>– Justin</p>
      `,
      replyTo: "justin@justintylers.com",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
