"use client";

import DragFileInput from "@/components/drag-file-input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const formSchema = z.object({
    password: z.string().min(1, {
        message: "请输入密码"
    }),
    file: z.any()
})

export default function Denuvo() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            file: null,
        },
    });
    const { toast } = useToast()
    const [current_file, set_current_file] = useState<File | null>(null);
    const [ticket_create_info, set_ticket_create_info] = useState<string | null>(null);
    const handleFiles = (files: File[]) => {
        console.log("选中文件", files);
        // 这里做上传/预览逻辑
        const first_file = files[0];
        const file_name = first_file.name;
        console.log(file_name);
        if (!file_name.endsWith(".ini")) {
            toast({
                title: "提示",
                description: "文件后缀错误，请检查是否是正确的文件",
                duration: 2000,
            });
            return;
        }
        const file_size = first_file.size;
        if (file_size > 1200) {
            toast({
                title: "提示",
                description: "文件过大",
                duration: 2000,
            });
            return;
        }
        set_current_file(first_file);
    };

    function create_ticket(values: z.infer<typeof formSchema>) {
        console.log(current_file);
        const form = new FormData();
        form.append('file', current_file as Blob);
        form.append('password', values.password); // 换成真实密码

        fetch('/api/denuvo/ticket', { method: 'POST', body: form })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                set_ticket_create_info(data.data);
            })
            .catch(err => {
                console.error(err);
                alert('上传失败: ' + err.message);
            });
    }

    async function copy_ticket() {
        try {
            await navigator.clipboard.writeText(ticket_create_info + "");
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
                    <form onSubmit={form.handleSubmit(create_ticket)} className="space-y-8">
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
                            name="file"
                            render={({}) => (
                                <FormItem>
                                    <FormLabel>CDK</FormLabel>
                                    <FormControl>
                                        <DragFileInput onFiles={handleFiles} />
                                    </FormControl>
                                    <FormDescription>
                                        {!!current_file && <Label>{current_file.name}</Label>}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">生成</Button>
                    </form>
                </Form>
                {!!ticket_create_info && (<Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>生成完成
                        <Button className="ml-2" onClick={copy_ticket}>点我复制</Button>
                    </AlertTitle>
                    <AlertDescription>
                        {ticket_create_info}
                    </AlertDescription>
                </Alert>)}

            </main>
        </div>
    );
}