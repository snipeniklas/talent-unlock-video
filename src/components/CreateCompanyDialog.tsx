import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: (companyId: string, companyName: string) => void;
}

interface CompanyFormData {
  name: string;
  website: string;
  industry: string;
  email: string;
  phone: string;
  status: string;
}

const initialFormData: CompanyFormData = {
  name: "",
  website: "",
  industry: "",
  email: "",
  phone: "",
  status: "prospect"
};

export default function CreateCompanyDialog({ open, onOpenChange, onCompanyCreated }: CreateCompanyDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: t('crm.companies.fields.name') + " is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await (supabase as any)
        .from("crm_companies")
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Company created successfully"
      });
      
      // Reset form and close dialog
      setFormData(initialFormData);
      onOpenChange(false);
      
      // Notify parent component
      onCompanyCreated(data.id, data.name);
      
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('crm.companies.addNew')}</DialogTitle>
          <DialogDescription>
            Create a new company to associate with this contact
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">{t('crm.companies.fields.name')} *</Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-website">{t('crm.companies.fields.website')}</Label>
            <Input
              id="company-website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-industry">{t('crm.companies.fields.industry')}</Label>
            <Input
              id="company-industry"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="Enter industry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-email">{t('crm.companies.fields.email')}</Label>
            <Input
              id="company-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-phone">{t('crm.companies.fields.phone')}</Label>
            <Input
              id="company-phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+49 123 456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-status">{t('crm.companies.fields.status')}</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">{t('crm.companies.status.prospect')}</SelectItem>
                <SelectItem value="qualified">{t('crm.companies.status.qualified')}</SelectItem>
                <SelectItem value="customer">{t('crm.companies.status.customer')}</SelectItem>
                <SelectItem value="inactive">{t('crm.companies.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : t('crm.actions.save')}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              {t('crm.actions.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}