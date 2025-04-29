import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { NextRequest } from 'next/server';

type Oper = "DENY" | "ALLOW";

type ValueType = "CDK" | "MACHINE";

type BlackConfigRequest = {
  value: string,
  password: string,
  oper: Oper,
  value_type: ValueType,
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

export async function POST(request: NextRequest) {
  const json_body: BlackConfigRequest = await request.json();
  const value = json_body["value"];
  const password = json_body["password"];
  const oper = json_body["oper"];
  const value_type = json_body["value_type"];
  if (password !== process.env.SUPER_PASSWORD) {
    return Response.json({ data: "fuck you!" });
  }
  let data = { data: "操作完成" };
  if (value_type == "CDK") {
    if (oper == "ALLOW") {
      await exec_mongo(async (unlocker_db: Db) => {
        const cdk_black_collection = unlocker_db?.collection("CdkBlackList");
        const cdk = await cdk_black_collection?.findOne({
          "value": value
        });
        if (!!cdk) {
          await cdk_black_collection.deleteOne({ _id: cdk._id });
          data = { data: "CDK解封成功" };
        } else {
          data = { data: "CDK未被封禁" };
        }
      });
    } else if (oper == "DENY") {
      await exec_mongo(async (unlocker_db: Db) => {
        const cdk_black_collection = unlocker_db?.collection("CdkBlackList");
        const cdk = await cdk_black_collection?.findOne({
          "value": value
        });
        if (!!cdk) {
          data = { data: "CDK已被封禁" };
        } else {
          await cdk_black_collection?.insertOne({
            value: value,
            reason: 0,
            expire_time: getTimestampAfterNDays(30),
          })
          data = { data: "CDK封禁完成" };
        }
      });
    }
  } else if (value_type == "MACHINE") {
    if (oper == "ALLOW") {
      await exec_mongo(async (unlocker_db: Db) => {
        const machine_black_collection = unlocker_db?.collection("MachineBlackList");
        const machine = await machine_black_collection?.findOne({
          "value": value
        });
        if (!!machine) {
          await machine_black_collection.deleteOne({ _id: machine._id });
          data = { data: "机器解封成功" };
        } else {
          data = { data: "机器未被封禁" };
        }
      });
    } else if (oper == "DENY") {
      await exec_mongo(async (unlocker_db: Db) => {
        const machine_black_collection = unlocker_db?.collection("MachineBlackList");
        const machine = await machine_black_collection?.findOne({
          "value": value
        });
        if (!!machine) {
          data = { data: "机器已被封禁" };
        } else {
          await machine_black_collection?.insertOne({
            value: value,
          })
          data = { data: "机器封禁完成" };
        }
      });
    }
  }

  return Response.json(data);
}