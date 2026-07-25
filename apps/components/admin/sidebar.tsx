"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Play, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, navHome, type NavGroup, type NavItem } from "./nav-config";

type SidebarProps = {
  mobileOpen: boolean;
  onCloseMobileAction: () => void;
};

function ActiveIndicator() {
  return (
    <motion.span
      layoutId="sidebar-active"
      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-full bg-primary"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );
}

function NavItemRow({
  item,
  isActive,
  onCloseMobileAction,
}: {
  item: NavItem;
  isActive: boolean;
  onCloseMobileAction: () => void;
}) {
  const Icon = item.icon;
  return (
    <li className="relative">
      {isActive && <ActiveIndicator />}
      <Link
        href={item.href}
        onClick={onCloseMobileAction}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {Icon && <Icon className={cn("size-4.5 shrink-0", isActive && "text-primary")} />}
        <span className="flex-1 text-left">{item.title}</span>
        {item.badge && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              isActive ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

function NavGroupDropdown({
  group,
  isOpen,
  onToggle,
  pathname,
  onCloseMobileAction,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onCloseMobileAction: () => void;
}) {
  const GroupIcon = group.icon;
  const isGroupActive = group.items.some((item) => pathname.startsWith(item.href));

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isGroupActive
            ? "bg-primary/15 text-primary"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        aria-expanded={isOpen}
      >
        <GroupIcon className={cn("size-4.5 shrink-0", isGroupActive && "text-primary")} />
        <span className="flex-1 text-left">{group.title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronRight className="size-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <NavItemRow
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    onCloseMobileAction={onCloseMobileAction}
                  />
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ mobileOpen, onCloseMobileAction }: SidebarProps) {
  const pathname = usePathname();
  const isHomeActive = pathname === navHome.href;

  // Auto-expand groups that have active items
  const getInitialOpenState = () => {
    const state: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      state[group.title] = group.items.some((item) => pathname.startsWith(item.href));
    });
    return state;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenState);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobileAction}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:self-start lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <Link href="/dash" className="flex items-center gap-2.5" onClick={onCloseMobileAction}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Play className="size-5 fill-current" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Kami-Sama</p>
              <p className="text-xs text-muted-foreground">Console streaming</p>
            </div>
          </Link>
          <button
            onClick={onCloseMobileAction}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Home link */}
          <ul className="space-y-0.5 mb-4">
            <NavItemRow item={navHome} isActive={isHomeActive} onCloseMobileAction={onCloseMobileAction} />
          </ul>

          {/* Grouped navigation with dropdowns */}
          {navGroups.map((group) => (
            <NavGroupDropdown
              key={group.title}
              group={group}
              isOpen={openGroups[group.title] ?? false}
              onToggle={() => toggleGroup(group.title)}
              pathname={pathname}
              onCloseMobileAction={onCloseMobileAction}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
