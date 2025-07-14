'use client';

import { Flame, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface DramaScoreProps {
  score: number; // 1-10
  className?: string;
}

export function DramaScore({ score, className = '' }: DramaScoreProps) {
  // Ensure score is between 1 and 10
  const normalizedScore = Math.max(1, Math.min(10, score));
  
  // Determine drama level and styling
  const getDramaLevel = (score: number) => {
    if (score <= 3) return {
      level: 'BAIXO',
      color: 'text-green-600',
      bgColor: 'bg-green-500/80',
      icon: TrendingUp,
      textColor: 'text-white'
    };
    if (score <= 6) return {
      level: 'MÉDIO',
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-500/80',
      icon: AlertTriangle,
      textColor: 'text-white'
    };
    if (score <= 8) return {
      level: 'ALTO',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/80', 
      icon: Zap,
      textColor: 'text-white'
    };
    return {
      level: 'EXTREMO',
      color: 'text-red-600',
      bgColor: 'bg-red-500/80',
      icon: Flame,
      textColor: 'text-white'
    };
  };

  const drama = getDramaLevel(normalizedScore);
  const Icon = drama.icon;

  return (
    <div className={`
      absolute bottom-2 right-2 
      ${drama.bgColor} backdrop-blur-sm
      rounded-lg px-2 py-1 
      flex items-center gap-1.5
      shadow-lg border border-white/20
      ${className}
    `}>
      <Icon className={`w-3 h-3 ${drama.textColor}`} />
      <span className={`text-xs font-bold ${drama.textColor}`}>
        {normalizedScore}/10
      </span>
      <span className={`text-xs font-medium ${drama.textColor} hidden sm:inline`}>
        {drama.level}
      </span>
    </div>
  );
}