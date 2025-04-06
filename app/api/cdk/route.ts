import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { verify_and_get_name, get_score } from "@/app/api/config"
import { insert_log, get_partner_score, change_partner_score } from '@/app/api/pgsql';
import { NextRequest } from 'next/server';
import { sendMail } from "@/app/api/mailer"

function generateRandomString() {
  // 包含大写字母和数字的字符串
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // 每组的长度
  const groupLength = 5;
  // 组的数量
  const groupCount = 4;
  // 用于存储每组字符的数组
  let result = '';

  // 生成每组字符
  for (let i = 0; i < groupCount; i++) {
    // 随机选择字符并拼接成组
    let group = '';
    for (let j = 0; j < groupLength; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      group += chars[randomIndex];
    }
    // 将生成的组添加到结果字符串中
    result += group;
    // 如果不是最后一组，添加连接符"-"
    if (i < groupCount - 1) {
      result += '-';
    }
  }

  return result;
}

function getTimestampAfterNDays(n: number) {
  // 获取当前时间戳（以毫秒为单位）
  const now = Date.now();
  // 将天数转换为毫秒（1天 = 24小时 * 60分钟 * 60秒 * 1000毫秒）
  const oneDay = 24 * 60 * 60 * 1000;
  // 计算n天后的时间戳
  const timestampAfterNDays = now + n * oneDay;
  return timestampAfterNDays;
}


type CreateCdkRequest = {
  cdk_type: string,
  password: string,
  numbers: number,
}

export async function POST(request: NextRequest) {
  const json_body: CreateCdkRequest = await request.json();
  const cdk_type = json_body["cdk_type"];
  const passowrd = json_body["password"];
  const numbers = json_body["numbers"] || 1;
  const creator = verify_and_get_name(passowrd)
  if (!!!creator) {
    return Response.json({ data: ["fuck you asshole!"] });
  }
  if (numbers > 1 && cdk_type != "once") {
    return Response.json({ data: ["仅限试用key可以批量生成！"] });
  }
  if (numbers > 10) {
    return Response.json({ data: ["生成的太多了！！"] });
  }
  // 获取要扣的积分
  const score: number = get_score(cdk_type);
  const total_score = Math.floor(score * numbers);
  // 获取管理人积分
  const partner_score = await get_partner_score(creator);
  if (partner_score < total_score) {
    return Response.json({ data: ["积分不足！"], partner_score });
  }
  const balance_left = partner_score - total_score;

  const document: Record<string, string | number | string[]> = {
    // "value": cdk_value,
    "machine_code": "",
    "games": [],
    "bind_times": 0,
    "create_time": Date.now(),
    "creator": creator,
    "bind_ip_history": [],
    "type_tag": cdk_type,
    "score": score,
  };

  if (cdk_type == "once") {
    document["expire_time"] = getTimestampAfterNDays(3);
    document["cdk_type"] = "temp";
    document["trial_times"] = 1;
  } if (cdk_type == "3day") {
    document["expire_time"] = getTimestampAfterNDays(3);
    document["cdk_type"] = "temp";
    document["trial_times"] = 3;
  } else if (cdk_type == "weekly") {
    document["expire_time"] = getTimestampAfterNDays(7);
    document["cdk_type"] = "temp";
    document["trial_times"] = 5;
  } else if (cdk_type == "monthly") {
    document["expire_time"] = getTimestampAfterNDays(31);
    document["cdk_type"] = "normal";
  } else if (cdk_type == "10years") {
    document["expire_time"] = getTimestampAfterNDays(365*10);
    document["cdk_type"] = "normal";
  } else if (cdk_type == "vip") {
    document["cdk_type"] = "vip";
  } else if (cdk_type == "onlyone") {
    document["expire_time"] = getTimestampAfterNDays(1);
    document["cdk_type"] = "temp";
    document["trial_times"] = 1;
  } else if (cdk_type == "seasonly") {
    document["expire_time"] = getTimestampAfterNDays(91);
    document["cdk_type"] = "normal";
  } else if (cdk_type == "yearly") {
    document["expire_time"] = getTimestampAfterNDays(365);
    document["cdk_type"] = "normal";
  }
  const cdk_list: string[] = [];
  await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    for (let i = 0; i < numbers; i++) {
      const cdk_value: string = generateRandomString();
      const new_cdk = { ...document, value: cdk_value };
      await cdk_collection?.insertOne(new_cdk);
      cdk_list.push(cdk_value);
    }
  });
  for (const cdk of cdk_list) {
    await insert_log({ oper_name: creator, oper_time: new Date(), cdk_value: cdk, oper_type: "CREATE", balance: balance_left });
  }
  await change_partner_score(creator, -1 * total_score);
  if (cdk_type != "once") {
    const result = await sendMail(process.env.MAIL_NOTIFY_EMIAL as string, `[CREATE KEY]CDK已创建-${creator}`, `${cdk_list[0]}  |  ${cdk_type}  |  ${balance_left}`);
    console.log(result);
  }
  return Response.json({ data: cdk_list, score_charge: total_score, partner_score: balance_left });
}