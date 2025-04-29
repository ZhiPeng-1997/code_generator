import { Plus, Delete, LockKeyholeOpen, Search, CircleFadingArrowUp, History, TimerReset, CircleDollarSign, Bot, Settings, WifiOff } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "CDK创建",
    url: "/",
    icon: Plus,
  },
  {
    title: "CDK删除",
    url: "/delete",
    icon: Delete,
  },
  {
    title: "CDK锁定",
    url: "/disable",
    icon: LockKeyholeOpen,
  },
  {
    title: "CDK查看",
    url: "/cdk",
    icon: Search,
  },
  {
    title: "CDK升级",
    url: "/cdk/upgrade",
    icon: CircleFadingArrowUp,
  },
  {
    title: "(代理)开卡历史",
    url: "/partner/history",
    icon: History,
  },
  {
    title: "(管理)充值",
    url: "/partner/charge",
    icon: CircleDollarSign,
  },
  {
    title: "(管理)重置绑定次数",
    url: "/reset",
    icon: TimerReset,
  },
  {
    title: "(管理)拉黑",
    url: "/black",
    icon: WifiOff,
  },
  {
    title: "(管理)任务发布",
    url: "/task/create",
    icon: Bot,
  },
  {
    title: "(管理)DLC配置",
    url: "/game/dlc",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CDK控制台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
