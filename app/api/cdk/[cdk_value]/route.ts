import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { NextApiRequest } from 'next/types';

export const dynamic = 'force-dynamic' // defaults to auto


export async function GET(request: NextApiRequest, { params }: { params: { cdk_value: string }}) {
  // console.log(params.cdk_value)
  const cdk_value = params.cdk_value;
  let cdk_info: any = {};
  const data = await exec_mongo(async (unlocker_db: Db) => {
    const cdk_collection = unlocker_db?.collection("Cdk");
    cdk_info = await cdk_collection?.findOne({
      "value": cdk_value,
    })
    return cdk_info;
  });
  // console.log(data);
  return Response.json(data);
}