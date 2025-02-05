import { Pool } from 'pg';

const log_open_switch = process.env.LOG_OPEN == "true"
console.log(log_open_switch);
let pool: Pool | null = null;
if (log_open_switch) {
    pool = new Pool({
        connectionString: process.env.LOG_DB_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
} else {
    pool = null;
}



export const insert_log = async function ({ oper_name, oper_time, cdk_value, oper_type }: { oper_name: string, oper_time: Date, cdk_value: string, oper_type: string }) {
    if (!log_open_switch) {
        return;
    }
    const client = await pool!.connect();
    try {
        // const { rows } = await client.query('SELECT * FROM posts');
        const res = await client.query(
            'INSERT INTO oper_log (oper_name, oper_time, cdk_value, oper_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [oper_name, oper_time, cdk_value, oper_type]
        );
        return res;
    } finally {
        client.release();
    }
}