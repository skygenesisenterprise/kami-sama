'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronsUpDown, Plus, Tv } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { navGroups, navHome } from '@/lib/navigation'
import { StatusBadge } from '@/components/dash/status-badge'

const workspaces = [
  { name: 'Kami-Sama Production', plan: 'Enterprise' },
  { name: 'Kami-Sama Staging', plan: 'Internal' },
  { name: 'Kami-Sama Dev', plan: 'Internal' },
]

function WorkspaceSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Tv className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Kami-Sama</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Production
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-64"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem key={ws.name} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Tv className="size-3.5 shrink-0" />
                  </div>
                  <span className="flex-1 truncate">{ws.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ws.plan}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border bg-transparent">
                  <Plus className="size-3.5" />
                </div>
                <span className="font-medium text-muted-foreground">
                  Add workspace
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Home"
                  isActive={pathname === navHome.href}
                  render={<Link href={navHome.href} />}
                >
                  {navHome.icon && <navHome.icon />}
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.map((group) => {
                const isGroupActive = group.items.some((item) =>
                  pathname.startsWith(item.href),
                )
                return (
                  <Collapsible
                    key={group.title}
                    defaultOpen={isGroupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            tooltip={group.title}
                            isActive={isGroupActive}
                          >
                            <group.icon />
                            <span>{group.title}</span>
                            <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        }
                      />
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton
                                isActive={pathname === item.href}
                                render={<Link href={item.href} />}
                              >
                                <span>{item.title}</span>
                              </SidebarMenuSubButton>
                              {item.badge && (
                                <SidebarMenuBadge>
                                  {item.badge}
                                </SidebarMenuBadge>
                              )}
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <StatusBadge tone="success" pulse>
            All systems operational
          </StatusBadge>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
