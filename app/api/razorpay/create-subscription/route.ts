import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRazorpay, PLANS, type PlanId } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please sign in to subscribe.' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }

    const plan = PLANS[planId as PlanId];
    const razorpay = getRazorpay();

    // Create a Razorpay subscription plan first, then create subscription
    // For simplicity, we use one-time orders with monthly recurrence handled via webhooks
    // Razorpay subscriptions require pre-created plans via dashboard or API

    // Create a Razorpay order for the first payment
    const order = await razorpay.orders.create({
      amount: plan.amount, // amount in smallest currency unit (cents for USD)
      currency: plan.currency,
      receipt: `sub_${planId}_${session.user.email}_${Date.now()}`,
      notes: {
        email: session.user.email,
        planId: planId,
        type: 'subscription',
        credits: plan.credits.toString(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create subscription error:', error);
    return NextResponse.json({ error: 'Failed to create subscription. Please try again.' }, { status: 500 });
  }
}
