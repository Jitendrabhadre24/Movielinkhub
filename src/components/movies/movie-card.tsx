"use client";

import Link from "next/link";
import Image from "next/image";
import { tmdb, Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface MovieCardProps {
  item: Movie;
  className?: string;
  type?: "movie" | "tv";
}

export function MovieCard({ item, className, type }: MovieCardProps) {
  const itemType = type || item.media_type || "movie";
  const posterUrl = tmdb.getImageUrl(item.poster_path);
  const title = item.title || item.name;

  return (
    <Link
      href={`/movie/${item.id}?type=${itemType}`}
      className={cn(
        "group relative flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg",
        className
      )}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title || "Poster"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 160px, 200px"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20 p-4 text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-3 space-y-1">
        <div className="flex items-center text-primary text-[10px] font-black">
          <Star className="h-3 w-3 mr-1 fill-current" />
          {item.vote_average?.toFixed(1) || "N/A"}
        </div>
        <span className="text-xs font-bold text-white truncate w-full">
          {title}
        </span>
      </div>
    </Link>
  );
}