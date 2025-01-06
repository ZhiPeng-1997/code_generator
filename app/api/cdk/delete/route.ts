import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 



type DeleteCdkRequest = {
  cdk_value: string,
  password: string,
}
 
export async function POST(request: Request) {
  const json_body: DeleteCdkRequest = await request.json();
  const cdk_value = json_body["cdk_value"];
  const passowrd = json_body["password"];
  if (passowrd != process.env.PASSWORD) {
    return Response.json({ data: "fuck you asshole!" })
  }
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk = await cdk_collection?.findOne({
      "value": cdk_value
    });
    if (!!cdk) {
      await cdk_collection?.deleteOne({
        "_id": cdk._id
      });
      return {data: "删除成功"};
    }
    return {data: "删除失败,CDK不存在"};
  });
  return Response.json(data);
}