import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order ASC`;
  return Response.json({ plans });
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const body = (await request.json()) as {
    name: string;
    price: number;
    billing_period: string;
    features: string[];
    is_featured: boolean;
    sort_order: number;
    rc_package_identifier?: string;
    apple_product_id?: string;
    google_product_id?: string;
  };
  const result = await sql`
    INSERT INTO subscription_plans (name, price, billing_period, features, is_featured, sort_order, rc_package_identifier, apple_product_id, google_product_id)
    VALUES (
      ${body.name}, ${body.price}, ${body.billing_period},
      ${JSON.stringify(body.features)}, ${body.is_featured}, ${body.sort_order},
      ${body.rc_package_identifier ?? ''}, ${body.apple_product_id ?? ''}, ${body.google_product_id ?? ''}
    )
    RETURNING *
  `;
  return Response.json({ plan: result[0] });
}
