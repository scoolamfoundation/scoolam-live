import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { plan_id } = body as { plan_id: number };

  if (!plan_id) {
    return Response.json({ error: 'Missing plan_id' }, { status: 400 });
  }

  const plans = await sql`SELECT * FROM subscription_plans WHERE id = ${plan_id}`;
  const plan = plans[0];
  if (!plan) {
    return Response.json({ error: 'Plan not found' }, { status: 404 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to environment.' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL ?? process.env.AUTH_URL ?? '';
  const planPrice = Number(plan.price);
  const billingPeriod = plan.billing_period as string;
  const isRecurring = billingPeriod === 'month' || billingPeriod === 'year';

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name as string,
            description: Array.isArray(plan.features)
              ? (plan.features as string[]).slice(0, 3).join(' • ')
              : 'Scoolam Premium',
          },
          unit_amount: Math.round(planPrice * 100),
          ...(isRecurring
            ? { recurring: { interval: billingPeriod === 'month' ? 'month' : 'year' } }
            : {}),
        },
        quantity: 1,
      },
    ],
    mode: isRecurring ? 'subscription' : 'payment',
    success_url: `${baseUrl}/api/subscriptions/success?session_id={CHECKOUT_SESSION_ID}&user_id=${encodeURIComponent(session.user.id)}&plan_id=${plan_id}`,
    cancel_url: `${baseUrl}/subscription-cancelled`,
    customer_email: session.user.email,
    metadata: {
      user_id: session.user.id,
      plan_id: String(plan_id),
    },
  });

  // Create admin notification for purchase attempt
  try {
    await sql`
      INSERT INTO admin_notifications (user_id, user_name, user_email, event_type, plan_name, plan_id, amount, platform, details)
      VALUES (
        ${session.user.id},
        ${session.user.name ?? ''},
        ${session.user.email ?? ''},
        'purchase_attempt',
        ${plan.name as string},
        ${plan_id},
        ${planPrice},
        'web',
        ${JSON.stringify({ stripe_session_id: checkoutSession.id, billing_period: billingPeriod })}
      )
    `;
  } catch (e) {
    console.error('Failed to log notification:', e);
  }

  return Response.json({ url: checkoutSession.url });
}
