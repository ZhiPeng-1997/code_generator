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
  numbers: z.coerce.number().int().positive(),
})

export default function Home() {
  const { toast } = useToast()
  const [cdk_value, set_cdk_value] = useState([])
  const [balance_left, set_balance_left] = useState(-1)
  const [score_charge, set_score_charge] = useState(-1)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      cdk_type: "1_normal",
      numbers: 1,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
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
        const { data, partner_score=-1, score_charge=-1 } = response;
        set_cdk_value(data);
        set_balance_left(partner_score);
        set_score_charge(score_charge);
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
      await navigator.clipboard.writeText(cdk_value.join("\n"));
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
                      <SelectItem value="1_normal">【✅不清除】1次卡（30天有效期）</SelectItem>
                      <SelectItem value="2_normal">【✅不清除】2次卡（30天有效期）</SelectItem>
                      <SelectItem value="3_normal">【✅不清除】🎁3次卡（3天有效期）</SelectItem>
                      <SelectItem value="3_trial">【❌清除】3次卡（3天有效期）</SelectItem>
                      <SelectItem value="5_trial">【❌清除】5次卡（7天有效期）</SelectItem>
                      <SelectItem value="monthly">【✅不清除】无限次（月卡）</SelectItem>
                      <SelectItem value="seasonly">【✅不清除】无限次（季度卡）</SelectItem>
                      <SelectItem value="yearly">【✅不清除】无限次（年卡）</SelectItem>
                      <SelectItem value="10years">【✅不清除】无限次（十年）</SelectItem>
                      <SelectItem value="vip">【✅不清除】VIP（永久）</SelectItem>
                      <SelectItem value="onekey">【✅不清除】一键入库（永久）</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    选择生成CDK的类型
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>生成数量</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    CDK生成数量
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">生成</Button>
          </form>
        </Form>
        {!!cdk_value && cdk_value.length > 0 && (<Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>生成完成
            <Button className="ml-2" onClick={copy_cdk}>点我复制</Button>
          </AlertTitle>
          <AlertDescription>
            {cdk_value.map(o => (<p key={o}>{o}</p>))}
            {score_charge != -1 && (<p>消费积分：{ score_charge }</p>)}
            {balance_left != -1 && (<p>剩余积分：{ balance_left }</p>)}
          </AlertDescription>
        </Alert>)}

      </main>
    </div>
  );
}
