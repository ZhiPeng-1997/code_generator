import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 
import { NextRequest } from 'next/server';
import { verify_and_get_name } from "@/app/api/config"



type DisableCdkRequest = {
  cdk_value: string,
  password: string,
  oper: string,
  disable_seconds: number | null,
}
 
export async function POST(request: NextRequest) {
  const json_body: DisableCdkRequest = await request.json();
  const cdk_value = json_body["cdk_value"];
  const passowrd = json_body["password"];
  const oper = json_body["oper"];
  const disable_seconds = json_body["disable_seconds"];
  const creator = verify_and_get_name(passowrd)
  if (!!!creator) {
    return Response.json({ data: "fuck you asshole!" })
  }
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk = await cdk_collection?.findOne({
      "value": cdk_value
    });
    if (!!cdk) {
      await cdk_collection?.updateOne({
        "_id": cdk._id
      }, {
        "$set": {
            "disable": oper == "DENY",
            "disable_endtime": oper == "DENY" ? (Date.now() + disable_seconds! * 1000): null,
        }
      });
      return {data: "操作成功"};
    }
    return {data: "操作失败,CDK不存在"};
  });
  return Response.json(data);
}