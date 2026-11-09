"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  href: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  round?: boolean;
  onPlay?: () => void;
}

export function MediaCard({
  href,
  imageUrl,
  title,
  subtitle,
  round,
  onPlay,
}: MediaCardProps) {
  return (
    <Link href={href} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative"
      >
        <div
          className={cn(
            "relative aspect-square overflow-hidden shadow-xl",
            round ? "rounded-full" : "rounded-2xl"
          )}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {onPlay && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onPlay();
              }}
              className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.3)] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
            >
              <Play className="w-5 h-5 fill-black ml-0.5" />
            </button>
          )}
        </div>
        <div className="mt-3 px-1">
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-white/50 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
