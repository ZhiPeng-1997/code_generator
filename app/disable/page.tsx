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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const operOptions = [{
  value: "DENY",
  desc: "禁用"
}, {
  value: "ALLOW",
  desc: "启用"
}];

const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
  oper: z.enum(["DENY", "ALLOW"]),
  cdk_value: z.string().min(23, {
    message: "请输入正确的cdk"
  }),
  disable_seconds: z.coerce.number().int().positive()
})

export default function Reset() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      cdk_value: "",
      oper: "DENY",
      disable_seconds: 3600,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    fetch('/api/cdk/disable', {
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
            <FormField
              control={form.control}
              name="oper"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>操作</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {operOptions.map(o => (
                        <FormItem key={o.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={o.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {o.desc}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    操作
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues().oper == "DENY" && (<FormField
              control={form.control}
              name="disable_seconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>封禁时间</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3600" {...field} />
                  </FormControl>
                  <FormDescription>
                    秒数
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />)}
            <Button type="submit">操作</Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
