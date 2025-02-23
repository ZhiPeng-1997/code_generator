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
import { Switch } from "@/components/ui/switch"
import { useState } from "react"


const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
  get_black: z.boolean().default(false),
  cdk_value: z.string().min(23, {
    message: "请输入正确的cdk"
  }),
})

export default function Delete() {
  const { toast } = useToast()
  const [balance_before, set_balance_before] = useState(-1)
  const [score_back, set_score_back] = useState(-1)
  const [balance_after, set_balance_after] = useState(-1)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      cdk_value: "",
      get_black: false,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    fetch('/api/cdk/delete', {
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
        const { data, partner_score_before=-1, partner_score_after = -1, score_back=-1 } = response;
        set_balance_before(partner_score_before);
        set_score_back(score_back);
        set_balance_after(partner_score_after);
        toast({
          title: "提示",
          description: data,
          duration: 1000,
        });
      })
      .catch(error => {
        // 处理错误
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
                    <Input placeholder="xxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    预置密码
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="get_black"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>拉黑</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange} />
                  </FormControl>
                  {/* <FormDescription>
                    拉黑
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cdk_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CDK</FormLabel>
                  <FormControl>
                    <Input placeholder="XXXXX-XXXXX-XXXXX-XXXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    CDK
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">删除</Button>
          </form>
        </Form>
        {balance_before > -1 && (<span>原有积分: {balance_before}</span>)}
        {score_back > -1 && (<span>返还积分: {score_back}</span>)}
        {balance_after > -1 && (<span>现有积分: {balance_after}</span>)}
      </main>
    </div>
  );
}
