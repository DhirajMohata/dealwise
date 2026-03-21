import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured — email not sent:', subject);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function welcomeEmailHTML(name: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">dealwise</h1>
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 4px;">Know your real rate before you sign</p>
      </div>
      <h2 style="font-size: 20px; color: #111827;">Welcome, ${name}!</h2>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
        Thanks for joining dealwise. You have <strong>50 free credits</strong> to analyze your freelance contracts.
      </p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
        Upload any contract and we'll tell you your real effective hourly rate — what you're actually getting paid after the fine print.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/analyze"
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Analyze Your First Contract
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
        dealwise · AI-powered contract analysis for freelancers
      </p>
    </div>
  `;
}

export function analysisCompleteEmailHTML(name: string, score: number, recommendation: string): string {
  const color = score >= 65 ? '#059669' : score >= 35 ? '#D97706' : '#DC2626';
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">dealwise</h1>
      </div>
      <h2 style="font-size: 20px; color: #111827;">Your Analysis is Ready, ${name}!</h2>
      <div style="text-align: center; margin: 24px 0; padding: 24px; background: #F9FAFB; border-radius: 12px;">
        <div style="font-size: 48px; font-weight: 700; color: ${color};">${score}</div>
        <div style="font-size: 14px; color: #6B7280;">out of 100</div>
        <div style="margin-top: 12px; display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; color: ${color}; background: ${color}15;">
          ${recommendation.toUpperCase().replace('_', ' ')}
        </div>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard"
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Full Report
        </a>
      </div>
    </div>
  `;
}

export function lowCreditsEmailHTML(name: string, creditsRemaining: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">dealwise</h1>
      </div>
      <h2 style="font-size: 20px; color: #111827;">You're running low on credits</h2>
      <p style="font-size: 15px; color: #4B5563;">
        Hi ${name}, you have <strong>${creditsRemaining} credits</strong> remaining. Each contract analysis uses 1-2 credits.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing"
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Get More Credits
        </a>
      </div>
    </div>
  `;
}
