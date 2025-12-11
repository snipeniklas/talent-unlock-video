import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserPlus, Plus, Play, Upload, RotateCcw } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";

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
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="h-4 w-4 mr-2" />
          {t("outreach.campaigns.quickActions.title")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onAddContacts}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("outreach.campaigns.quickActions.addContacts")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImportCsv}>
          <Upload className="h-4 w-4 mr-2" />
          {t("outreach.campaigns.quickActions.importCsv")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddSequence}>
          <Plus className="h-4 w-4 mr-2" />
          {t("outreach.campaigns.quickActions.addSequence")}
        </DropdownMenuItem>
        {(campaignStatus === 'active' || campaignStatus === 'paused') && (
          <DropdownMenuItem onClick={onProcessNow}>
            <Play className="h-4 w-4 mr-2" />
            {t("outreach.campaigns.quickActions.processNow")}
          </DropdownMenuItem>
        )}
        {(campaignStatus === 'active' || campaignStatus === 'paused') && onResetToDraft && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetToDraft} className="text-orange-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("outreach.campaigns.quickActions.resetToDraft")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
