'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
  app_id: z.coerce.number().int(),
  exclude_dlc_list: z.array(z.object({
    value: z.string(),
  }))
})

export default function Dlc() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      app_id: 0,
      exclude_dlc_list: []
    },
  })

  const { append, remove } = useFieldArray({
    control: form.control,
    name: "exclude_dlc_list"
  });



  function get_current_dlc_list() {
    const current_app_id = form.getValues().app_id;
    fetch(`/api/game/dlc/${current_app_id}`, {
      method: 'GET', // 或者 'PUT'
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据类型为JSON
      },
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
        const { exclude_list }: {exclude_list: Array<string>} = data;
        form.setValue("exclude_dlc_list", exclude_list.map(o => ({value: o})))
      })
      .catch(error => {
        // 处理错误
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const post_data: {password?: string, app_id?: string, exclude_list?: Array<string>} = {};
    post_data["app_id"] = values.app_id + "";
    post_data["password"] = values.password;
    post_data["exclude_list"] = values.exclude_dlc_list.filter(o => !!o.value).map(o => (o.value));
    fetch('/api/game/dlc', {
      method: 'POST', // 或者 'PUT'
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据类型为JSON
      },
      body: JSON.stringify(post_data) // 将JavaScript对象转换为JSON字符串
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
                    <Input type="password" placeholder="xxx" {...field} />
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
              name="app_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>APP ID</FormLabel>
                  <FormControl>
                    <Input placeholder="xxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    APP ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button onClick={get_current_dlc_list} type="button">查询</Button>
            {form.getValues().exclude_dlc_list.map((value, index) => (
              <div key={index} className="flex w-full max-w-sm items-center space-x-2">
                <Input key={index} placeholder="000000" defaultValue={value.value} {...form.register(`exclude_dlc_list.${index}.value`)} />
                <Button onClick={() => remove(index)} variant="destructive" type="button">删除</Button>
              </div>
            ))}
            <br/>
            <Button type="button" onClick={() => append({value: ""})}>添加</Button>
            <br />
            <Button type="submit">提交</Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
