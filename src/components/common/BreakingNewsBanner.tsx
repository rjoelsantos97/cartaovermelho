"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface BreakingNews {
  id: string;
  title: string;
  timestamp: string;
}

interface BreakingNewsBannerProps {
  news: BreakingNews[];
  className?: string;
  scrollSpeed?: number;
}

export function BreakingNewsBanner({ 
  news, 
  className, 
  scrollSpeed = 50 
}: BreakingNewsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [news.length]);
  
  if (news.length === 0) return null;
  
  return (
    <div className={cn("breaking-banner overflow-hidden relative", className)}>
      <div className="flex items-center h-full">
        <div className="flex-shrink-0 bg-red-800 px-4 py-2 font-headline text-sm">
          ÚLTIMA HORA
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * 100}%)` 
            }}
          >
            {news.map((item) => (
              <div 
                key={item.id}
                className="w-full flex-shrink-0 px-4 py-2 flex items-center justify-between"
              >
                <span className="font-medium truncate">
                  {item.title}
                </span>
                <time className="text-xs opacity-75 ml-4 flex-shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 px-2">
          <div className="flex space-x-1">
            {news.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex 
                    ? "bg-white" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}