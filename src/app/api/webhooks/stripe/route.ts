import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { userSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe only if configured
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper to safely extract subscription period end
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  // Stripe subscriptions have current_period_end as a Unix timestamp
  const periodEnd = 'current_period_end' in subscription
    ? (subscription as Stripe.Subscription & { current_period_end: number }).current_period_end
    : Math.floor(Date.now() / 1000);
  return new Date(periodEnd * 1000);
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.log('Stripe not configured - ignoring webhook');
    return NextResponse.json({ received: true });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe!.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
          const plan = session.metadata?.plan as 'byok' | 'pro';
          const userId = session.metadata?.userId;
          
          if (!userId || !plan) {
            console.error('Missing metadata in checkout session:', session.metadata);
            break;
          }

          // Log the subscription object for debugging
          console.log('Stripe subscription object:', JSON.stringify(subscription, null, 2));

          // Create or update user subscription
          const periodEnd = getSubscriptionPeriodEnd(subscription);
          await db.insert(userSubscriptions).values({
            userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            plan,
            status: subscription.status,
            currentPeriodEnd: periodEnd,
          }).onConflictDoUpdate({
            target: userSubscriptions.userId,
            set: {
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              plan,
              status: subscription.status,
              currentPeriodEnd: periodEnd,
            }
          });

          console.log('Successfully saved subscription to database');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Updating subscription:', subscription.id, 'status:', subscription.status);

        await db.update(userSubscriptions)
          .set({
            status: subscription.status,
            currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Canceling subscription:', subscription.id);
        
        // Mark subscription as canceled
        await db.update(userSubscriptions)
          .set({ status: 'canceled' })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice === 'object' && 'subscription' in invoice ? (invoice as { subscription?: string }).subscription : undefined;
        if (subId && typeof subId === 'string') {
          console.log('Payment failed for subscription:', subId);
          
          // Mark subscription as past_due
          await db.update(userSubscriptions)
            .set({ status: 'past_due' })
            .where(eq(userSubscriptions.stripeSubscriptionId, subId));
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice === 'object' && 'subscription' in invoice ? (invoice as { subscription?: string }).subscription : undefined;
        if (subId && typeof subId === 'string') {
          console.log('Payment succeeded for subscription:', subId);
          
          // Mark subscription as active
          await db.update(userSubscriptions)
            .set({ status: 'active' })
            .where(eq(userSubscriptions.stripeSubscriptionId, subId));
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 