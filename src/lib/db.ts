import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is not defined");
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client in Trilha DB pool', err);
    });
  }

  return pool;
}

/**
 * Execute a query with default search_path set to trilha
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getPool();
  const client = await p.connect();
  try {
    // Ensure search_path defaults to trilha schema
    await client.query("SET search_path TO trilha, public;");
    const res = await client.query<T>(text, params);
    return res;
  } finally {
    client.release();
  }
}

export async function getClient(): Promise<PoolClient> {
  const p = getPool();
  const client = await p.connect();
  await client.query("SET search_path TO trilha, public;");
  return client;
}

export default { query, getClient };
