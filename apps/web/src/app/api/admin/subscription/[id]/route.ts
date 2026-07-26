import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    price?: number;
    billing_period?: string;
    features?: string[];
    is_featured?: boolean;
    sort_order?: number;
    rc_package_identifier?: string;
    apple_product_id?: string;
    google_product_id?: string;
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (body.name !== undefined) {
    setClauses.push(`name = $${i++}`);
    values.push(body.name);
  }
  if (body.price !== undefined) {
    setClauses.push(`price = $${i++}`);
    values.push(body.price);
  }
  if (body.billing_period !== undefined) {
    setClauses.push(`billing_period = $${i++}`);
    values.push(body.billing_period);
  }
  if (body.features !== undefined) {
    setClauses.push(`features = $${i++}`);
    values.push(JSON.stringify(body.features));
  }
  if (body.is_featured !== undefined) {
    setClauses.push(`is_featured = $${i++}`);
    values.push(body.is_featured);
  }
  if (body.sort_order !== undefined) {
    setClauses.push(`sort_order = $${i++}`);
    values.push(body.sort_order);
  }
  if (body.rc_package_identifier !== undefined) {
    setClauses.push(`rc_package_identifier = $${i++}`);
    values.push(body.rc_package_identifier);
  }
  if (body.apple_product_id !== undefined) {
    setClauses.push(`apple_product_id = $${i++}`);
    values.push(body.apple_product_id);
  }
  if (body.google_product_id !== undefined) {
    setClauses.push(`google_product_id = $${i++}`);
    values.push(body.google_product_id);
  }

  if (setClauses.length === 0)
    return Response.json({ error: 'nothing to update' }, { status: 400 });

  values.push(Number(id));
  const result = await sql(
    `UPDATE subscription_plans SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return Response.json({ plan: result[0] });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const { id } = await params;
  await sql`DELETE FROM subscription_plans WHERE id = ${Number(id)}`;
  return Response.json({ success: true });
}
