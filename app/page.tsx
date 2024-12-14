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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"


const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
  cdk_type: z.string(),
})

export default function Home() {
  const { toast } = useToast()
  const [cdk_value, set_cdk_value] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      cdk_type: "weekly",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    fetch('/api/cdk', {
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
        const { data } = response;
        set_cdk_value(data);
        toast({
          title: "提示",
          description: "生成成功",
          duration: 1000,
        });
      })
      .catch(error => {
        // 处理错误
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  async function copy_cdk() {
    try {
      await navigator.clipboard.writeText(cdk_value);
      toast({
        title: "提示",
        description: "已复制到剪切板",
        duration: 500,
      });
    } catch (err) {
      console.error('复制到剪切板失败: ', err);
    }
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
              name="cdk_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择生成类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">七日体验卡（三次入库）</SelectItem>
                      <SelectItem value="monthly">月卡（15次入库）</SelectItem>
                      <SelectItem value="yearly">年卡（无限制）</SelectItem>
                      <SelectItem value="vip">VIP（永久）</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    选择生成CDK的类型
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">生成</Button>
          </form>
        </Form>
        {!!cdk_value && (<Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>生成完成
            <Button className="ml-2" onClick={copy_cdk}>点我复制</Button>
          </AlertTitle>
          <AlertDescription>
            {cdk_value}
          </AlertDescription>
        </Alert>)}

      </main>
    </div>
  );
}
