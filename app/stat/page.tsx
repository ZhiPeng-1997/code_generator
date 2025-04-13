"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"

const chartConfig = {
    temp: {
        label: "Temp",
        color: "hsl(var(--chart-1))",
    },
    normal: {
        label: "Normal",
        color: "hsl(var(--chart-2))",
    },
    vip: {
        label: "Vip",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export default function Stat () {
    const [chartData, setChartData] = useState([])
    useEffect(() => {
        fetch("/api/stat")
            .then(res => res.json())
            .then(data => data.data)
            .then(setChartData)
    }, []);
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20  sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <Card className="w-[60vw]">
                    <CardHeader>
                        <CardTitle>CDK - 趋势图</CardTitle>
                        <CardDescription>近一周</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={true}
                                    tickMargin={10}
                                    axisLine={true}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <Bar dataKey="temp" fill="var(--color-temp)" radius={4} />
                                <Bar dataKey="normal" fill="var(--color-normal)" radius={4} />
                                <Bar dataKey="vip" fill="var(--color-vip)" radius={4} />

                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            CDK生成数据  <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            近一周
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
