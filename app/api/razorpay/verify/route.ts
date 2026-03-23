import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { verifyPaymentSignature, PLANS, type PlanId } from '@/lib/razorpay';
import { addCredits, setUserPlan } from '@/lib/credits';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    const email = session.user.email;
    const plan = PLANS[planId as PlanId];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }

    // Add credits to user
    await addCredits(email, plan.credits);

    // Upgrade plan to pro
    await setUserPlan(email, 'pro');

    // Log the payment in Supabase
    await supabase.from('payments').insert({
      email,
      razorpay_order_id,
      razorpay_payment_id,
      plan_id: planId,
      amount: plan.amount,
      currency: plan.currency,
      credits_added: plan.credits,
      status: 'paid',
      created_at: new Date().toISOString(),
    }).then(() => {/* ignore errors for logging */});

    return NextResponse.json({
      success: true,
      message: `${plan.credits} credits added to your account!`,
      creditsAdded: plan.credits,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Verification failed. Please contact support.' }, { status: 500 });
  }
}
