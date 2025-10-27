import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserPlus, Plus, Play, Upload, RotateCcw } from "lucide-react";

interface QuickActionsMenuProps {
  onAddContacts: () => void;
  onAddSequence: () => void;
  onProcessNow: () => void;
  onImportCsv: () => void;
  onResetToDraft?: () => void;
  campaignStatus: string;
}

export function QuickActionsMenu({
  onAddContacts,
  onAddSequence,
  onProcessNow,
  onImportCsv,
  onResetToDraft,
  campaignStatus,
}: QuickActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="h-4 w-4 mr-2" />
          Schnellaktionen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onAddContacts}>
          <UserPlus className="h-4 w-4 mr-2" />
          Kontakte hinzufügen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImportCsv}>
          <Upload className="h-4 w-4 mr-2" />
          Kontakte importieren (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddSequence}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Sequenz hinzufügen
        </DropdownMenuItem>
        {(campaignStatus === 'active' || campaignStatus === 'paused') && (
          <DropdownMenuItem onClick={onProcessNow}>
            <Play className="h-4 w-4 mr-2" />
            Kampagne jetzt verarbeiten
          </DropdownMenuItem>
        )}
        {(campaignStatus === 'active' || campaignStatus === 'paused') && onResetToDraft && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetToDraft} className="text-orange-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurück zu Entwurf
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
