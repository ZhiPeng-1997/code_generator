import { Db, MongoClient } from "mongodb"


export default async function(callback: (db: Db) => void) {
    const client = new MongoClient(process.env.DB_URL as string, {});
    try {
        await client.connect();
        const db = client.db("steam_unlocker");
        await callback(db);
    } finally {
        await client.close();
    }
};