import { NextRequest } from 'next/server';
import { verify_and_get_name } from "@/app/api/config"
import { default as exec_mongo } from '@/app/api/mongo'
import { Db } from 'mongodb';


type PartnerHistoryRequest = {
  password: string,
}

export async function POST(request: NextRequest) {
  const json_body: PartnerHistoryRequest = await request.json();
  const passowrd = json_body["password"];
  const partner_name = verify_and_get_name(passowrd);
  if (!!!partner_name) {
    return Response.json({ msg: "密码不对，再想想！！" });
  }

  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk_history_list = cdk_collection.find({"creator": partner_name,}).sort({"_id": -1}).limit(30).toArray();
    return cdk_history_list;
  });


  return Response.json({ msg: "查询完成", data: data });
}