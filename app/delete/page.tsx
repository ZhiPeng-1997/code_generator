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


const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
  cdk_value: z.string().min(23, {
    message: "请输入正确的cdk"
  }),
})

export default function Delete() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      cdk_value: "",
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
        const { data } = response;
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
            <Button type="submit">生成</Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
