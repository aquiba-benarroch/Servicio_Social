import { Badge } from '@/components/ui/badge';
import { OrganizationStatus, OpportunityStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: OrganizationStatus | OpportunityStatus | 'registered' | 'attended' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-accent text-accent-foreground' },
    approved: { label: 'Aprobada', className: 'bg-success text-success-foreground' },
    rejected: { label: 'Rechazada', className: 'bg-destructive text-destructive-foreground' },
    draft: { label: 'Borrador', className: 'bg-muted text-muted-foreground' },
    published: { label: 'Publicada', className: 'bg-primary text-primary-foreground' },
    closed: { label: 'Cerrada', className: 'bg-secondary text-secondary-foreground' },
    registered: { label: 'Registrado', className: 'bg-primary text-primary-foreground' },
    attended: { label: 'Asistió', className: 'bg-success text-success-foreground' },
    cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground' },
  };

  const variant = variants[status] || variants.pending;

  return (
    <Badge className={variant.className}>
      {variant.label}
    </Badge>
  );
}
