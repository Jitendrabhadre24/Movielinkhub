"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl, Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface MovieCardProps {
  item: Movie;
  className?: string;
  type?: "movie" | "tv";
}

export function MovieCard({ item, className, type }: MovieCardProps) {
  const itemType = type || item.media_type || "movie";
  const posterUrl = getImageUrl(item.poster_path);
  const title = item.title || item.name;
  const releaseYear = (item.release_date || item.first_air_date || "").split("-")[0];
  
  // Logic for a "Quality" tag as a visual placeholder
  const quality = item.vote_average > 7 ? "4K UHD" : "HD";

  return (
    <Link
      href={`/movie/${item.id}?type=${itemType}`}
      className={cn(
        "group block flex-shrink-0 w-36 sm:w-44 md:w-52 transition-all duration-300 animate-fade-in",
        className
      )}
    >
      <div className="space-y-3">
        {/* Card Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[#111] shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-active:scale-95">
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg group-hover:bg-primary transition-colors group-hover:border-primary">
            <Star className="h-3 w-3 text-primary fill-primary group-hover:text-black group-hover:fill-black" />
            <span className="text-[11px] font-black text-white group-hover:text-black">
              {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
            </span>
          </div>

          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title || "Poster"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 180px, 220px"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/10 p-4 text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{title}</span>
            </div>
          )}
          
          {/* Subtle Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Metadata Section */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 leading-tight transition-colors group-hover:text-white/100 group-hover:glow-text-primary">
              {title}
            </h3>
            <span className="shrink-0 text-[9px] font-black border border-primary/30 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider bg-primary/5">
              {quality}
            </span>
          </div>
          <p className="text-xs text-white/60 font-medium">
            {releaseYear || "N/A"}
          </p>
        </div>
      </div>
    </Link>
  );
}
