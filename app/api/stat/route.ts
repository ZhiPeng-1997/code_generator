import { Db } from 'mongodb';
import { default as exec_mongo } from '@/app/api/mongo'


function getTimestampRange() {
    // 获取当前日期的午夜时间（24时）
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    // 向前推七天
    const startOfDay = new Date(endOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 返回时间戳数组
    return [startOfDay.getTime(), endOfDay.getTime()];
}

function getStartOfDay(timestamp: number) {
    // 将毫秒时间戳转换为Date对象
    const date = new Date(timestamp);

    // 设置时间为当天的零点
    date.setHours(0, 0, 0, 0);

    // 返回零点时间的时间戳
    return date.getTime();
}

function formatDate(timestamp: number) {
    const date = new Date(timestamp);

    const yyyy = date.getFullYear(); // 获取年份
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，+1是因为月份从0开始
    const dd = String(date.getDate()).padStart(2, '0'); // 获取日期

    return `${yyyy}-${mm}-${dd}`;
}

export const revalidate = 0;

export async function GET() {
    const time_range = getTimestampRange();
    const result: { date: string; temp: number; normal: number; vip: number; }[] = []
    await exec_mongo(async (unlocker_db: Db) => {
        const cdk_collection = unlocker_db?.collection("Cdk");
        const cdk_cursor = cdk_collection?.find({
            create_time: {
                $gte: time_range[0], // 大于或等于起始时间
                $lt: time_range[1]     // 小于结束时间
            },
            machine_code: {
                $ne: "",
            }
        }, {
            projection: {
                "_id": 1,
                "cdk_type": 1,
                "create_time": 1
            }
        });
        const cdk_list = await cdk_cursor.toArray()
        const temp_map: { [key: number]: [number, number, number] } = {};
        for (const cdk of cdk_list) {
            const day_key = getStartOfDay(cdk.create_time);
            const cdk_type = cdk.cdk_type;
            if (!(day_key in temp_map)) {
                temp_map[day_key] = [0, 0, 0];
            }
            if (cdk_type == "temp") {
                temp_map[day_key][0] = temp_map[day_key][0] + 1;
            } else if (cdk_type == "normal") {
                temp_map[day_key][1] = temp_map[day_key][1] + 1;
            } else {
                temp_map[day_key][2] = temp_map[day_key][2] + 1;
            }
            
        }
        // 排序
        const temp_list: [number, [number, number, number]][] = []
        for (const k of Object.keys(temp_map)) {
            const key = parseInt(k);
            const v = temp_map[key];
            temp_list.push([key, v])
        }
        temp_list.sort(i => i[0]);
        for (const item of temp_list) {
            const date_str = formatDate(item[0]);
            result.push({
                date: date_str,
                temp: item[1][0],
                normal: item[1][1],
                vip: item[1][2],
            });
        }
    });
    return Response.json({ data: result }); 
}