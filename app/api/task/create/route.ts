import { NextRequest } from 'next/server';
import { default as exec_mongo } from '@/app/api/mongo'
import { Db } from 'mongodb';


type PartnerChargeRequest = {
  app_id: number,
  command: string,
  password: string,
  force_hidden_dlc: boolean
}

export async function POST(request: NextRequest) {
  const json_body: PartnerChargeRequest = await request.json();
  const passowrd = json_body["password"];
  const app_id = json_body["app_id"];
  const command = json_body["command"];
  const force_hidden_dlc = json_body["force_hidden_dlc"];
  if (passowrd !== process.env.SUPER_PASSWORD) {
    return Response.json({ data: "去你妈的！" });
  }

  await exec_mongo(async (unlocker_db: Db) => {
    const task_collection = unlocker_db?.collection("UpdateTask");
    await task_collection.insertOne({
      "command": command,
      "status": "wait",
      "params": command == "upgrade" ? 
      { "app_id": app_id + "", "force_hidden_dlc": force_hidden_dlc } : {},
    })
  });


  return Response.json({ data: "提交完成" });
}