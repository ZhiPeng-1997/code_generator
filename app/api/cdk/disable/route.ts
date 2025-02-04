import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 
import { NextRequest } from 'next/server';



type DisableCdkRequest = {
  cdk_value: string,
  password: string,
  oper: string
}
 
export async function POST(request: NextRequest) {
  const json_body: DisableCdkRequest = await request.json();
  const cdk_value = json_body["cdk_value"];
  const passowrd = json_body["password"];
  const oper = json_body["oper"];
  if (passowrd != process.env.PASSWORD) {
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
        }
      });
      return {data: "操作成功"};
    }
    return {data: "操作失败,CDK不存在"};
  });
  return Response.json(data);
}