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
import { useRouter } from 'next/navigation';


const formSchema = z.object({
  cdk_value: z.string().min(23, {
    message: "请输入正确的cdk"
  }),
})

export default function Cdk() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cdk_value: ""
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const cdk_value = values.cdk_value
    router.push(`/cdk/${cdk_value}`);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <Button type="submit">查看</Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
