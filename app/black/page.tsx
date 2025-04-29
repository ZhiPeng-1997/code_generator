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
  desc: "封禁"
}, {
  value: "ALLOW",
  desc: "解禁"
}];


const valueTypeOptions = [{
  value: "CDK",
  desc: "CDK"
}, {
  value: "MACHINE",
  desc: "机器"
}];

const formSchema = z.object({
  password: z.string().min(1, {
    message: "请输入密码"
  }),
  oper: z.enum(["DENY", "ALLOW"]),
  value: z.string().min(1, {
    message: "请输入正确的值"
  }),
  value_type: z.enum(["CDK", "MACHINE"]),
})

export default function Black() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      value: "",
      oper: "DENY",
      value_type: "CDK",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    fetch('/api/black/config', {
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
            <FormField
              control={form.control}
              name="value_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类型</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {valueTypeOptions.map(o => (
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
                    封禁类型
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>值（CDK/机器ID）</FormLabel>
                  <FormControl>
                    <Input placeholder="XX" {...field} />
                  </FormControl>
                  <FormDescription>
                    CDK/机器ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">提交</Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
