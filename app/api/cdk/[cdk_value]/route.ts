import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' // defaults to auto


export async function GET(request: NextRequest, { params }: { params: { cdk_value: string }}) {
  // console.log(params.cdk_value)
  const cdk_value = params.cdk_value;
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    const cdk_info = await cdk_collection?.findOne({
      "value": cdk_value,
    })
    if (!!cdk_info) {
      return cdk_info;
    }
    return {"result": "CDK不存在"};
  });
  // console.log(data);
  return Response.json(data);
}