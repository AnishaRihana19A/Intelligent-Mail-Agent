import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Send, FileText, Plug, LogOut, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: Send },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Integrations", url: "/integrations", icon: Plug },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar variant="sidebar" className="border-r border-border/50 bg-card/50 backdrop-blur-xl">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Donut's Mailer
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Overview
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={`
                            transition-all duration-200 py-5
                            ${isActive 
                              ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium' 
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            }
                          `}
                        >
                          <Link href={item.url} className="flex items-center gap-3 w-full px-2">
                            <item.icon className="h-5 w-5" />
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
          <SidebarFooter className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
          </header>
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/20 p-6 md:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
