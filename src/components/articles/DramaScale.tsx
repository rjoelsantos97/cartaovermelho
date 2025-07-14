'use client';

import { TrendingUp, AlertTriangle, Zap, Flame } from 'lucide-react';

interface DramaScaleProps {
  score: number; // 1-10
  className?: string;
}

export function DramaScale({ score, className = '' }: DramaScaleProps) {
  // Ensure score is between 1 and 10
  const normalizedScore = Math.max(1, Math.min(10, score));
  
  // Determine drama level and styling
  const getDramaLevel = (score: number) => {
    if (score <= 3) return {
      level: 'BAIXO',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: TrendingUp,
      description: 'Situação Controlada'
    };
    if (score <= 6) return {
      level: 'MODERADO',
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: AlertTriangle,
      description: 'Atenção Requerida'
    };
    if (score <= 8) return {
      level: 'ALTO',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300',
      icon: Zap,
      description: 'Drama Intenso'
    };
    return {
      level: 'EXTREMO',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300', 
      icon: Flame,
      description: 'CAOS TOTAL'
    };
  };

  const drama = getDramaLevel(normalizedScore);
  const Icon = drama.icon;
  
  // Calculate percentage for progress bar
  const percentage = (normalizedScore / 10) * 100;

  return (
    <div className={`p-4 rounded-lg border-2 ${drama.bgColor} ${drama.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${drama.color}`} />
          <span className="text-sm font-medium text-gray-700">
            ESCALA DE DRAMA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${drama.color}`}>
            {normalizedScore}/10
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            normalizedScore <= 3 ? 'bg-green-500' :
            normalizedScore <= 6 ? 'bg-yellow-500' :
            normalizedScore <= 8 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Drama Level and Description */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${drama.color}`}>
          NÍVEL: {drama.level}
        </span>
        <span className="text-xs text-gray-600">
          {drama.description}
        </span>
      </div>
    </div>
  );
}