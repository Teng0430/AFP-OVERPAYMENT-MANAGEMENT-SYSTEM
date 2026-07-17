import { Eye, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Pensioner } from '@/types';

interface PensionerActionsMenuProps {
  pensioner: Pensioner;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPrint: (id: number) => void;
  onDelete: (id: number) => void;
}

export function PensionerActionsMenu({ pensioner, onView, onEdit, onPrint, onDelete }: PensionerActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Row actions">
        <DropdownMenuItem
          onClick={() => onView(pensioner.id)}
          aria-label="View pensioner details"
        >
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(pensioner.id)}
          aria-label="Edit pensioner"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onPrint(pensioner.id)}
          aria-label="Print pensioner summary"
        >
          <Printer className="h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(pensioner.id)}
          aria-label="Delete pensioner"
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
