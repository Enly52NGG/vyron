"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Compass,
  Library,
  Heart,
  Clock,
  ListMusic,
  Disc3,
  Mic2,
  Settings,
  Plus,
} from "lucide-react";
import { useLibraryStore } from "@/store/library-store";
import { motion } from "framer-motion";

const mainNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/explore", label: "Explore", icon: Compass },
];

const libraryNav = [
  { href: "/library", label: "Your Library", icon: Library },
  { href: "/liked", label: "Liked Songs", icon: Heart },
  { href: "/recent", label: "Recently Played", icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();
  const { playlists, createPlaylist } = useLibraryStore();

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col glass-strong border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)]">
            <span className="text-black font-bold text-sm tracking-tighter">V</span>
          </div>
          <span className="text-xl font-semibold tracking-tight group-hover:opacity-80 transition-opacity">
            VYRON
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="px-3 space-y-0.5">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", active && "text-white")}
                strokeWidth={active ? 2 : 1.5}
              />
              {item.label}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Library section */}
      <div className="mt-6 px-3">
        <p className="px-3 text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2">
          Library
        </p>
        <div className="space-y-0.5">
          {libraryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Playlists */}
      <div className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
            Playlists
          </p>
          <button
            onClick={() => createPlaylist("Новый плейлист")}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Создать плейлист"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-0.5">
          {playlists.length === 0 && (
            <p className="px-3 py-2 text-xs text-white/30">Нет плейлистов</p>
          )}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                pathname === `/playlist/${pl.id}`
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              <ListMusic className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{pl.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-5 h-5" strokeWidth={1.5} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
