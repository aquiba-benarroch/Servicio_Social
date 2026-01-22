import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export function DashboardStat({ label, value, icon, description }: DashboardStatProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-semibold mb-1">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
