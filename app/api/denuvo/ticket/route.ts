import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'
import { verify_and_get_name } from "@/app/api/config"
import { NextRequest, NextResponse } from 'next/server';

function generateRandomUppercaseString() {
  const length = 8;
  let result = '';
  for (let i = 0; i < length; i++) {
    // A的ASCII码是65，Z是90
    const randomCharCode = Math.floor(Math.random() * 26) + 65;
    result += String.fromCharCode(randomCharCode);
  }
  return result;
}
function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000); // 秒→毫秒
  const pad = (n: number) => n.toString().padStart(2, '0');

  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}
export async function POST(request: NextRequest) {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const formData = await request.formData();
    // console.log(123);
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string;

    /* ---------- 1. 简单鉴权 ---------- */
    const creator = verify_and_get_name(password)
    if (!!!creator) {
      return Response.json({ data: "fuck you asshole!" })
    }

    /* ---------- 2. 文件合法性检查 ---------- */
    if (!file) {
      return NextResponse.json({ data: 'Missing file' }, { status: 400 });
    }
    if (file.size > 1200) {
      return NextResponse.json({ data: 'Only plain text files are accepted' }, { status: 400 });
    }

    /* ---------- 3. 读取文本 ---------- */
    const text = await file.text();
    // console.log(text);
    /* ---------- 4. 正则提取字段 ---------- */
    const appIdMatch = text.match(/^#\s*APP_ID:\s*(\d+)\s*$/m);
    const timeMatch = text.match(/^#\s*GENERATE_TIME:\s*(\d+)\s*$/m);
    const ticketMatch = text.match(/^ticket=(.*)$/m);
    const steamIdMatch = text.match(/^account_steamid=(\d+)$/m);
    // console.log("123", ticketMatch, steamIdMatch);

    if (!appIdMatch || !timeMatch || !ticketMatch || !steamIdMatch) {
      return NextResponse.json(
        { data: 'File format error: missing APP_ID or GENERATE_TIME' }
      );
    }

    const appId = parseInt(appIdMatch[1]);
    const generateTime = parseInt(timeMatch[1]);
    const expireTime = generateTime + 30 * 60;
    if (expireTime < nowInSeconds) {
      return NextResponse.json({ data: "票据已经过期" });
    }
    const ticket = ticketMatch[1];
    const steam_id = steamIdMatch[1];
    // console.log(ticket, steam_id_match);
    const random_ticket_code = generateRandomUppercaseString();
    await exec_mongo(async (unlocker_db: Db) => {
        const ticket_collection = unlocker_db?.collection("DenuvoTicket");
        await ticket_collection.insertOne({
          "generate_time": generateTime,
          "expire_time": expireTime,
          "creator": creator,
          "ticket_code": random_ticket_code,
          "ticket_hex": ticket,
          "ticket_steam_id": steam_id,
          "use_times": 5,
          "app_id": appId,
        });
    });

    /* ---------- 5. 返回结果 ---------- */
    return NextResponse.json({ data: `本次为APPID[${appId}]生成的D加密授权码为:【${random_ticket_code}】, 有效时间截止至${formatTimestamp(expireTime)}, 请尽快使用！` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: 'Server error' }, { status: 500 });
  }
}