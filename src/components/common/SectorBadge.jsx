import { Badge } from '@/components/ui/badge';
import { sectorBadge } from '@/data/sectors';
import { cn } from '@/lib/utils';

export function SectorBadge({ sector, className }) {
  return <Badge className={cn(sectorBadge(sector), className)}>{sector}</Badge>;
}
