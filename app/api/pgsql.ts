import { Pool } from 'pg';

const log_open_switch = process.env.LOG_OPEN == "true"
// console.log(log_open_switch);
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



export const insert_log = async function ({ oper_name, oper_time, cdk_value, oper_type, balance = -1 }: { oper_name: string, oper_time: Date, cdk_value: string, oper_type: string, balance: number }) {
    if (!log_open_switch) {
        return;
    }
    const client = await pool!.connect();
    try {
        // const { rows } = await client.query('SELECT * FROM posts');
        const res = await client.query(
            'INSERT INTO oper_log (oper_name, oper_time, cdk_value, oper_type, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [oper_name, oper_time, cdk_value, oper_type, balance]
        );
        return res;
    } finally {
        client.release();
    }
}

export const get_partner_score = async function (partner_name: string) {
    const client = await pool!.connect();
    try {
        // const { rows } = await client.query('SELECT * FROM posts');
        const res = await client.query(
            'SELECT partner_name, balance FROM partner_score where partner_name = $1',
            [partner_name]
        );
        if (res.rowCount! < 1) {
            return -1;
        }
        const first_row = res.rows[0];
        return first_row["balance"] || -1;
    } finally {
        client.release();
    }
}

export const change_partner_score = async function (partner_name: string, change_number: number) {
    const client = await pool!.connect();
    try {
        // const { rows } = await client.query('SELECT * FROM posts');
        const res = await client.query(
            'update partner_score set balance = balance + $1 where partner_name = $2',
            [change_number, partner_name]
        );
        return res;
    } finally {
        client.release();
    }
}

export const insert_charge_log = async function ({ oper_time, partner_name, change_number, balance_before, balance_after }: { oper_time: Date, partner_name: string, change_number: number, balance_before: number, balance_after:number }) {
    const client = await pool!.connect();
    try {
        // const { rows } = await client.query('SELECT * FROM posts');
        const res = await client.query(
            'INSERT INTO charge_log (oper_time, partner_name, change_number, balance_before, balance_after) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [oper_time, partner_name, change_number, balance_before, balance_after]
        );
        return res;
    } finally {
        client.release();
    }
}