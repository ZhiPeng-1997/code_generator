import { Db } from 'mongodb';
import {default as exec_mongo} from '../mongo' 

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
}
 
export async function POST(request: Request) {
  const json_body: CreateCdkRequest = await request.json();
  const cdk_type = json_body["cdk_type"];
  const passowrd = json_body["password"];
  if (passowrd != process.env.PASSWORD) {
    return Response.json({ data: "fuck you asshole!" })
  }
  const cdk_value: string = generateRandomString();
  const document: Record<string, string|number|string[]> = {
    "value": cdk_value,
    "machine_code": "",
    "games": [],
    "bind_times": 0,
  };

  if (cdk_type == "weekly") {
    document["expire_time"] = getTimestampAfterNDays(7);
    document["cdk_type"] = "temp";
    document["trial_times"] = 3;
  } else if (cdk_type == "monthly") {
    document["expire_time"] = getTimestampAfterNDays(31);
    document["cdk_type"] = "normal";
  } else if (cdk_type == "seasonly") {
    document["expire_time"] = getTimestampAfterNDays(92);
    document["cdk_type"] = "normal";
  } else if (cdk_type == "vip") {
    document["cdk_type"] = "vip";
  }
  await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    await cdk_collection?.insertOne(document);
  });
  return Response.json({ data: cdk_value });
}