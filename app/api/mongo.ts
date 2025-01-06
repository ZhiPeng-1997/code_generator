import { Db, MongoClient } from "mongodb"


export default async function(callback: (db: Db) => object | void) {
    const client = new MongoClient(process.env.DB_URL as string, {});
    try {
        await client.connect();
        const db = client.db("steam_unlocker");
        return await callback(db);
    } finally {
        await client.close();
    }
};