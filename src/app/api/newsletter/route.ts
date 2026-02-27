import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    await resend.emails.send({
      from: "Justin Angeles <hello@mail.justintylers.com>",
      to: email,
      subject: "You're on the list",
      html: `
        <p>Hey, thanks for subscribing.</p>
        <p>I'll send you an email when I publish new articles or launch new projects.</p>
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
