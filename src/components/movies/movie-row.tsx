"use client";

import { useRef, useState, useEffect } from "react";
import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  items: Movie[];
  type?: "movie" | "tv";
  viewAllHref?: string;
}

export function MovieRow({ title, items, type, viewAllHref }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Convert vertical scroll to horizontal scroll for desktop mouse users
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY !== 0 && scrollRef.current) {
      // If the user is scrolling vertically, move horizontally
      // We don't preventDefault here to allow parent scrolling if needed, 
      // but for premium OTT rows, horizontal capture is often preferred.
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    // Record starting position
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Prevent text selection/image dragging
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-6 py-6 group/row">
      <div className="px-6 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link 
            href={viewAllHref}
            className="flex items-center gap-1 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic"
          >
            VIEW ALL <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "no-scrollbar flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden select-none",
          "snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 px-6 md:px-12 lg:px-16 pb-6",
          isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x"
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="snap-start flex-none w-[140px] sm:w-[180px] md:w-[220px]"
          >
            <MovieCard 
              item={item} 
              type={type} 
              className={cn(
                "w-full",
                isDragging && "pointer-events-none" // Prevent clicks while dragging
              )} 
            />
          </div>
        ))}
        {/* End-of-row spacer for consistent padding */}
        <div className="flex-none w-6 md:w-16" />
      </div>
    </section>
  );
}
