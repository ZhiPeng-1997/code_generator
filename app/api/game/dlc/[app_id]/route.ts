import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' // defaults to auto


export async function GET(request: NextRequest, { params }: { params: { app_id: string }}) {
  // console.log(params.cdk_value)
  const app_id = params.app_id;
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const dlc_collection = unlocker_db?.collection("ExcludeDlc");
    const dlc_info = await dlc_collection?.findOne({
      "app_id": app_id,
    })
    if (!!dlc_info) {
      return {data: dlc_info};
    }
    return {data: {app_id: app_id, exclude_list: []}}
  });
  // console.log(data);
  return Response.json(data);
}