import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 
import { NextRequest } from 'next/server';
import { verify_and_get_name } from "@/app/api/config"


type ResetCdkRequest = {
  cdk_value: string,
  password: string,
  bind_times: number,
}
 
export async function POST(request: NextRequest) {
  const json_body: ResetCdkRequest = await request.json();
  const cdk_value = json_body["cdk_value"];
  const passowrd = json_body["password"];
  const bind_times = json_body["bind_times"];
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
            "bind_times": bind_times,
        }
      });
      return {data: "重置成功"};
    }
    return {data: "重置失败,CDK不存在"};
  });
  return Response.json(data);
}