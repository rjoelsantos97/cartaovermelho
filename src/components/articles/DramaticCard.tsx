import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UrgencyLevel = "low" | "medium" | "high" | "breaking";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  urgency: UrgencyLevel;
  publishedAt: string;
  dramaScore?: number;
  imageUrl?: string;
}

interface DramaticCardProps {
  article: Article;
  className?: string;
  onClick?: () => void;
}

const urgencyConfig = {
  low: {
    label: "NORMAL",
    className: "urgency-low",
    badgeVariant: "secondary" as const,
  },
  medium: {
    label: "IMPORTANTE",
    className: "urgency-medium", 
    badgeVariant: "default" as const,
  },
  high: {
    label: "É VERMELHO",
    className: "urgency-high",
    badgeVariant: "destructive" as const,
  },
  breaking: {
    label: "ÚLTIMA HORA",
    className: "urgency-breaking",
    badgeVariant: "destructive" as const,
  },
};

export function DramaticCard({ article, className, onClick }: DramaticCardProps) {
  const urgencyInfo = urgencyConfig[article.urgency];
  
  return (
    <Card 
      className={cn(
        "dramatic-card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
        urgencyInfo.className,
        className
      )}
      onClick={onClick}
    >
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={urgencyInfo.badgeVariant} className="font-headline text-xs">
            {urgencyInfo.label}
          </Badge>
          {article.dramaScore && (
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              DRAMA: {article.dramaScore}/10
            </Badge>
          )}
        </div>
        
        <CardTitle className="font-headline text-xl leading-tight text-white line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-gray-200 text-sm line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="font-medium uppercase tracking-wide">
            {article.category}
          </span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString('pt-PT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}