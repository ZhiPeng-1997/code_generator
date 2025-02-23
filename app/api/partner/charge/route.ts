import { NextRequest } from 'next/server';
import { change_partner_score, insert_charge_log, get_partner_score } from '@/app/api/pgsql'
import { PASSWORD_MAP } from "@/app/api/config"


type PartnerChargeRequest = {
  change_number: number,
  password: string,
  partner_name: string,
}

export async function POST(request: NextRequest) {
  const json_body: PartnerChargeRequest = await request.json();
  const partner_name = json_body["partner_name"];
  const passowrd = json_body["password"];
  const change_number = json_body["change_number"];
  if (passowrd !== process.env.SUPER_PASSWORD) {
    return Response.json({ data: "去你妈的！" });
  }
  if (change_number == 0) {
    return Response.json({ data: "木有必要吧！" });
  }
  // console.log(PASSWORD_MAP);
  if (Object.values(PASSWORD_MAP).indexOf(partner_name) < 0) {
    return Response.json({ data: "该合作方代码不存在" });
  }

  const balance_before = await get_partner_score(partner_name);
  const balance_after = Math.floor(balance_before + change_number);

  await change_partner_score(partner_name, change_number);
  await insert_charge_log({ oper_time: new Date(), partner_name: partner_name, change_number: change_number, balance_before: balance_before, balance_after: balance_after })

  return Response.json({ data: "变更完成" });
}