import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { verify_and_get_name, get_score } from "@/app/api/config"
import { insert_log, get_partner_score, change_partner_score } from '@/app/api/pgsql';
import { NextRequest } from 'next/server';
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


type UpgradeCdkRequest = {
  cdk_type: string,
  password: string,
  value: string,
}

export async function POST(request: NextRequest) {
  const json_body: UpgradeCdkRequest = await request.json();
  const cdk_type = json_body["cdk_type"];
  const passowrd = json_body["password"];
  const value = json_body["value"];
  const creator = verify_and_get_name(passowrd)
  if (!!!creator) {
    return Response.json({ data: ["fuck you asshole!"] });
  }
  // 获取升级的目标的积分
  const score: number = get_score(cdk_type);
  // 获取该cdk的积分
  const result = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk = await cdk_collection?.findOne({
      "value": value
    });
    if (!!!cdk) {
      return { data: ["CDK不对哈！"]}
    }
    const cdk_creator = cdk.creator;
    const cdk_score = cdk.score || 0;
    if (cdk_score >= score) {
      return { data: ["向下升级？CDK无升级必要"]}
    }
    // 获取管理人积分
    const partner_score = await get_partner_score(cdk_creator);
    // 计算要扣除的差额
    const score_diff = score - cdk_score;
    if (score_diff > partner_score) {
      return { data: [`积分不足, 需扣除: ${score_diff}, 当前剩余: ${partner_score}`]};
    }

    const update_data:Record<string, string | number| object> = {};
    // 修改cdk
    if (cdk_type == "10years") {
      update_data["$set"] = {
        "expire_time": getTimestampAfterNDays(365*10),
        "cdk_type": "normal",
        "type_tag": cdk_type,
        "score": score
      };
    } else if (cdk_type == "vip") {
      update_data["$set"] = {
        "cdk_type": "vip",
        "type_tag": cdk_type,
        "score": score
      };
      update_data["$unset"] = {
        "expire_time": "",
      };
    } else if (cdk_type == "yearly") {
      update_data["$set"] = {
        "expire_time": getTimestampAfterNDays(365),
        "cdk_type": "normal",
        "type_tag": cdk_type,
        "score": score
      };
    } else if (cdk_type == "monthly") {
      update_data["$set"] = {
        "expire_time": getTimestampAfterNDays(31),
        "cdk_type": "normal",
        "type_tag": cdk_type,
        "score": score
      };
    } else if (cdk_type == "seasonly") {
      update_data["$set"] = {
        "expire_time": getTimestampAfterNDays(90),
        "cdk_type": "normal",
        "type_tag": cdk_type,
        "score": score
      };
    }
    const balance_left = partner_score - score_diff;

    await insert_log({ oper_name: creator, oper_time: new Date(), cdk_value: value, oper_type: "UPGRADE", balance: balance_left, cdk_owner: cdk_creator });
    await change_partner_score(creator, -1 * score_diff);
    await cdk_collection.updateOne({"_id": cdk._id}, update_data);
    const result = await sendMail(process.env.MAIL_NOTIFY_EMIAL as string, `[CREATE KEY]CDK已升级-${cdk_creator}`, `${value}  |  升级为${cdk_type}  |  ${balance_left}`);
    console.log(result);
    return { data: [`${value}升级完成`], score_charge: score_diff, partner_score: balance_left }
  });

  return Response.json(result);
}