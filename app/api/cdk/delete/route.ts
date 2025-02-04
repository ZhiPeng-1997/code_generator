import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 
import { sendMail } from "@/app/api/mailer"
function getTimestampAfterNDays(n: number) {
  // 获取当前时间戳（以毫秒为单位）
  const now = Date.now();
  // 将天数转换为毫秒（1天 = 24小时 * 60分钟 * 60秒 * 1000毫秒）
  const oneDay = 24 * 60 * 60 * 1000;
  // 计算n天后的时间戳
  const timestampAfterNDays = now + n * oneDay;
  return timestampAfterNDays;
}

type DeleteCdkRequest = {
  cdk_value: string,
  password: string,
  get_black: boolean,
}
 
export async function POST(request: Request) {
  const json_body: DeleteCdkRequest = await request.json();
  const cdk_value = json_body["cdk_value"];
  const passowrd = json_body["password"];
  const get_black = json_body["get_black"];
  if (passowrd != process.env.PASSWORD) {
    return Response.json({ data: "fuck you asshole!" })
  }
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk = await cdk_collection?.findOne({
      "value": cdk_value
    });
    if (!!cdk) {

      if (get_black && !!cdk.machine_code) {
        const cdk_black_collection = unlocker_db?.collection("CdkBlackList");
        const machine_black_collection = unlocker_db?.collection("MachineBlackList");

        await cdk_black_collection.insertOne({
          value: cdk.value,
          expire_time: getTimestampAfterNDays(30),
        });

        await machine_black_collection.insertOne({
          value: cdk.machine_code,
        })
      }

      await cdk_collection?.deleteOne({
        "_id": cdk._id
      });
      sendMail(process.env.MAIL_NOTIFY_EMIAL as string, "[DELETE KEY]CDK已删除", cdk.value + "  ||  " + cdk.cdk_type)
      return {data: "删除成功"};
    }
    return {data: "删除失败,CDK不存在"};
  });
  return Response.json(data);
}