import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' // defaults to auto


type DlcUpdateRequest = {
  password: string,
  app_id: string,
  exclude_list: string[],
} 

export async function POST(request: NextRequest) {
  // console.log(params.cdk_value)
  const body: DlcUpdateRequest = await request.json();
  const password = body["password"];
  if (password !== process.env.SUPER_PASSWORD) {
    return Response.json({ data: "去你妈的！" });
  }
  const app_id = body["app_id"];
  const exclude_list = body["exclude_list"];
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const dlc_collection = unlocker_db?.collection("ExcludeDlc");
    const dlc_info = await dlc_collection?.findOne({
      "app_id": app_id,
    })
    if (dlc_info == null) {
      await dlc_collection?.insertOne({
        app_id: app_id,
        exclude_list: exclude_list,
      })
      return {data: "新增成功"};
    }
    // assert(!!dlc_info, "dlc info为空");
    await dlc_collection?.updateOne({
      _id: dlc_info._id,
    }, {
      "$set": {
        exclude_list: exclude_list,
      }
    })
    return {data: "更新成功"}
  });
  // console.log(data);
  return Response.json(data);
}