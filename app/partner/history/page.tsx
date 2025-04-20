'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { formatTimestamp } from "@/app/utils/TimeUtils"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"


type CdkHistory = {
  value: string
  type_tag: string,
  create_time: string
  first_bind_time: string,
  game_count: number
}

const columns: ColumnDef<CdkHistory>[] = [
  {
    id: "value",
    accessorKey: "value",
    header: "CDK",
  },
  {
    id: "type_tag",
    accessorKey: "type_tag",
    header: "CDK类型",
    cell: ({ row }) => {
      const type_tag = row.getValue("type_tag");
      let type_name = null;
      if (type_tag == "1_normal") {
        type_name = "1次永久";
      } else if (type_tag == "2_normal") {
        type_name = "2次试用";
      } else if (type_tag == "3_normal") {
        type_name = "3次试用";
      } else if (type_tag == "3_trial") {
        type_name = "3次试用";
      } else if (type_tag == "5_trial") {
        type_name = "5次试用";
      } else if (type_tag == "monthly") {
        type_name = "月卡";
      } else if (type_tag == "vip") {
        type_name = "VIP";
      } else if (type_tag == "10years") {
        type_name = "永久";
      } else if (type_tag == "yearly") {
        type_name = "年卡";
      } else if (type_tag == "seasonly") {
        type_name = "季度卡";
      } else {
        type_name = "--";
      }
      return (<span>{type_name}</span>);
    }
  },
  {
    id: "create_time",
    accessorKey: "create_time",
    header: "创建时间",
    cell: ({ row }) => (<span>{!!row.getValue("create_time") ? formatTimestamp(row.getValue("create_time")) : "--"}</span>),
  },
  {
    id: "first_bind_time",
    accessorKey: "first_bind_time",
    header: "首次绑定时间",
    cell: ({ row }) => (<span>{!!row.getValue("first_bind_time") ? formatTimestamp(row.getValue("first_bind_time")) : "--"}</span>),
  },
  {
    id: "game_count",
    accessorKey: "game_count",
    header: "游戏数量",
    // cell: ({row}) => {
    //   const games: number[] = row.getValue("games");
    //   console.log(row);
    //   return (<span>{!!games ? games.length: -1}</span>)
    // }
  },
]

const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
})

export default function PartnerHistory() {
  const { toast } = useToast()
  const [cdkHistoryList, setCdkHistoryList] = useState<CdkHistory[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })


  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
    fetch('/api/partner/history', {
      method: 'POST', // 或者 'PUT'
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据类型为JSON
      },
      body: JSON.stringify(values) // 将JavaScript对象转换为JSON字符串
    })
      .then(response => {
        // 检查响应状态
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // 解析JSON数据
      })
      .then(response => {
        // 处理返回的JSON数据
        const { data = [], msg }: { data: Record<string, number[] | string | number>[], msg: string } = response;
        setCdkHistoryList(data.map(o => ({
          ...o,
          game_count: Array.isArray(o.games) ? o.games.length: 0
        })) as CdkHistory[]);
        toast({
          title: "提示",
          description: msg || "查询成功",
          duration: 1000,
        });
      })
      .catch(error => {
        // 处理错误
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20  sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="xxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    预置密码
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">查询</Button>
          </form>
        </Form>
        <DataTable data={cdkHistoryList} columns={columns}></DataTable>
      </main>
    </div>
  );
}
