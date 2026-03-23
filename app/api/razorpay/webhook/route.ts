import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, PLANS, type PlanId } from '@/lib/razorpay';
import { addCredits, setUserPlan } from '@/lib/credits';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('Razorpay webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    switch (eventType) {
      case 'payment.captured': {
        // Payment was successfully captured
        const payment = event.payload.payment.entity;
        const email = payment.notes?.email;
        const planId = payment.notes?.planId as PlanId | undefined;
        const credits = parseInt(payment.notes?.credits || '0', 10);

        if (email && credits > 0) {
          await addCredits(email, credits);

          if (planId && PLANS[planId]) {
            await setUserPlan(email, 'pro');
          }

          // Log payment
          await supabase.from('payments').insert({
            email,
            razorpay_order_id: payment.order_id,
            razorpay_payment_id: payment.id,
            plan_id: planId || 'unknown',
            amount: payment.amount,
            currency: payment.currency,
            credits_added: credits,
            status: 'captured',
            created_at: new Date().toISOString(),
          }).then(() => {});
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const email = payment.notes?.email;

        if (email) {
          await supabase.from('payments').insert({
            email,
            razorpay_order_id: payment.order_id || '',
            razorpay_payment_id: payment.id,
            plan_id: payment.notes?.planId || 'unknown',
            amount: payment.amount,
            currency: payment.currency,
            credits_added: 0,
            status: 'failed',
            created_at: new Date().toISOString(),
          }).then(() => {});
        }
        break;
      }

      case 'subscription.charged': {
        // Recurring subscription payment succeeded
        const subscription = event.payload.subscription.entity;
        const payment = event.payload.payment.entity;
        const email = subscription.notes?.email;
        const planId = subscription.notes?.planId as PlanId | undefined;

        if (email && planId && PLANS[planId]) {
          const plan = PLANS[planId];
          await addCredits(email, plan.credits);
          await setUserPlan(email, 'pro');

          await supabase.from('payments').insert({
            email,
            razorpay_order_id: subscription.id,
            razorpay_payment_id: payment.id,
            plan_id: planId,
            amount: plan.amount,
            currency: plan.currency,
            credits_added: plan.credits,
            status: 'subscription_charged',
            created_at: new Date().toISOString(),
          }).then(() => {});
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.halted': {
        const subscription = event.payload.subscription.entity;
        const email = subscription.notes?.email;

        if (email) {
          await setUserPlan(email, 'free');
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
