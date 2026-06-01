import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Heart, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export type NavItem = { title: string; url: string; icon: LucideIcon };

export function DashboardShell({
  items,
  label,
  user,
  children,
}: {
  items: NavItem[];
  label: string;
  user: { name: string; role: string; avatar: string };
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-secondary/30">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 px-2 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground shadow-soft">
                <Heart className="h-4 w-4" fill="currentColor" />
              </span>
              <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">MediCompare</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <p className="text-sm font-semibold">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
              <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
