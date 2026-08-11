import { Pool, neonConfig } from '@neondatabase/serverless';
import '@/lib/db-config';

/**
 * Local-dev-compatible SQL helper.
 *
 * In production this module uses Neon's HTTP query endpoint via `neon()`. For
 * local Postgres (behind `NEON_WS_PROXY` wsproxy) the HTTP endpoint is not
 * available, so we fall back to the WebSocket `Pool` transport — exposing the
 * same surface used across the API routes: a tagged template that resolves to
 * the rows array, a `query` alias, and `transaction([...queries])`.
 *
 * The tagged template returns a deferred query (like `neon()`): it is only
 * executed when awaited, which lets `transaction()` run several queries on a
 * single pooled connection inside one transaction.
 */

type Strings = string[] & { raw: readonly string[] };

interface DeferredQuery<T = any> extends Promise<T[]> {
  __strings: Strings;
  __values: unknown[];
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function buildQuery(strings: Strings, values: unknown[]) {
  let text = '';
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) text += `$${i + 1}`;
  }
  return { text, values };
}

function makeDeferred(strings: Strings, values: unknown[]): DeferredQuery {
  const exec = async (client?: any) => {
    const { text } = buildQuery(strings, values);
    const res = client
      ? await client.query(text, values)
      : await pool.query(text, values);
    return res.rows;
  };

  const deferred: any = (client?: any) => exec(client);
  // Make it awaitable (resolves to rows) without executing until awaited.
  deferred.then = function (onfulfilled: any, onrejected: any) {
    return Promise.resolve(exec()).then(onfulfilled, onrejected);
  };
  deferred.__strings = strings;
  deferred.__values = values;
  return deferred as DeferredQuery;
}

const sql: any = (strings: Strings, ...values: unknown[]) =>
  makeDeferred(strings, values);

sql.query = sql;

sql.transaction = async function (queries: DeferredQuery[]): Promise<any[][]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results: any[][] = [];
    for (const q of queries) {
      const { text, values } = buildQuery(q.__strings, q.__values);
      const res = await client.query(text, values);
      results.push(res.rows);
    }
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

export default sql;
