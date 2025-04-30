import { Db } from 'mongodb';
import {default as exec_mongo} from '@/app/api/mongo' 
import { insert_log, get_partner_score, change_partner_score } from '@/app/api/pgsql' 
import { sendMail } from "@/app/api/mailer"
import { verify_and_get_name } from "@/app/api/config"
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
      const cdk_games = cdk.games || [];
      const is_used = cdk_games.length > 0;
      const cdk_creator = cdk.creator;
      const partner_score = await get_partner_score(cdk_creator);
      let create_score = cdk.score || 0;
      // 不拉黑但是使用过？不返点
      if (!get_black && is_used) {
        create_score = 0;
      }
      const partner_balance = partner_score + create_score;
      if (get_black && !!cdk.machine_code) {
        const cdk_black_collection = unlocker_db?.collection("CdkBlackList");
        const machine_black_collection = unlocker_db?.collection("MachineBlackList");

        try {
          await cdk_black_collection.insertOne({
            value: cdk.value,
            expire_time: getTimestampAfterNDays(30),
            reason: 0,
          });
        } catch(e) {
          console.error(e);
        }
        

        try {
          await machine_black_collection.insertOne({
            value: cdk.machine_code,
          })
        } catch(e) {
          console.error(e);
        }
        
      }

      await cdk_collection?.deleteOne({
        "_id": cdk._id
      });
      const result = await sendMail(process.env.MAIL_NOTIFY_EMIAL as string, `[DELETE KEY]CDK已删除-${cdk_creator}`, cdk.value + "  ||  " + (cdk.type_tag || cdk.cdk_type) + "  ||  " + `操作人：${creator} 实际所有人:${cdk_creator}`  +  "  ||  "  + partner_balance + "  ||  " + (get_black? "拉黑": "不拉黑") );
      console.log(result);
      await change_partner_score(cdk_creator, create_score);
      await insert_log({oper_name: creator, oper_time: new Date(), cdk_value: cdk_value, oper_type: "DELETE", balance: partner_balance});
      return {data: "删除成功", score_back:create_score, partner_score_before: partner_score, partner_score_after: partner_balance};
    }
    return {data: "删除失败,CDK不存在"};
  });
  return Response.json(data);
}