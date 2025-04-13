"use client"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
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
import React, { useEffect, useState } from "react"
// const chartData = [
//     { month: "January", desktop: 186, mobile: 80 },
//     { month: "February", desktop: 305, mobile: 200 },
//     { month: "March", desktop: 237, mobile: 120 },
//     { month: "April", desktop: 73, mobile: 190 },
//     { month: "May", desktop: 209, mobile: 130 },
//     { month: "June", desktop: 214, mobile: 140 },
// ]
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
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={true}
                                    axisLine={true}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="temp"
                                    type="natural"
                                    fill="var(--color-temp)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-temp)"
                                    stackId="a"
                                />
                                <Area
                                    dataKey="normal"
                                    type="natural"
                                    fill="var(--color-normal)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-normal)"
                                    stackId="a"
                                />
                                <Area
                                    dataKey="vip"
                                    type="natural"
                                    fill="var(--color-vip)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-vip)"
                                    stackId="a"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 font-medium leading-none">
                                    CDK生成数据 <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                    近一周
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
