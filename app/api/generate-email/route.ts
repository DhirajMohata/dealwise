import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json();
  const { redFlags, missingClauses, clientName, contractorName, contractType } = body;

  // Build the email using the flags
  const greeting = clientName ? `Hi ${clientName},` : "Hi,";
  const senderName = contractorName || session?.user?.name || "[Your Name]";

  let email = `${greeting}\n\nThank you for sending over the contract. I'm excited about this project and looking forward to working together.\n\nI've reviewed the agreement carefully and would love to discuss a few points to make sure we're both protected and set up for a great collaboration:\n\n`;

  // Group flags by priority
  const criticalFlags = redFlags?.filter((f: { severity: string }) => f.severity === 'critical') || [];
  const highFlags = redFlags?.filter((f: { severity: string }) => f.severity === 'high') || [];
  const otherFlags = redFlags?.filter((f: { severity: string }) => f.severity !== 'critical' && f.severity !== 'high') || [];

  let pointNumber = 1;

  const allImportantFlags = [...criticalFlags, ...highFlags, ...otherFlags.slice(0, 2)];

  for (const flag of allImportantFlags) {
    email += `**${pointNumber}. ${(flag.issue || '').replace('AI: ', '')}**\n`;
    email += `${flag.impact?.split('.')[0] || 'This could create issues down the line'}. `;
    if (flag.suggestion) {
      email += `Could we adjust this to: "${flag.suggestion.replace(/^(Replace with:|Add:|Counter with:)\s*/i, '')}"\n\n`;
    } else {
      email += `I'd love to discuss an alternative approach here.\n\n`;
    }
    pointNumber++;
  }

  // Add missing clauses (top 2-3)
  const importantMissing = (missingClauses || []).filter((m: { importance: string }) => m.importance === 'critical' || m.importance === 'important').slice(0, 3);

  if (importantMissing.length > 0) {
    email += `I also noticed a few standard protections that would be great to include:\n\n`;
    for (const mc of importantMissing) {
      email += `**${pointNumber}. ${mc.name}**\n`;
      email += `${mc.description?.split('.')[0]}. Suggested language: "${mc.suggestedLanguage?.substring(0, 150) || ''}"\n\n`;
      pointNumber++;
    }
  }

  email += `These are standard adjustments that protect both of us and are common in ${contractType || 'freelance'} agreements. I'm happy to discuss any of these points.\n\n`;
  email += `Looking forward to your thoughts!\n\nBest,\n${senderName}`;

  return NextResponse.json({ email });
}
