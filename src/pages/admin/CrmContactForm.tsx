import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateCompanyDialog from "@/components/CreateCompanyDialog";

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  position: string;
  department: string;
  status: string;
  priority: string;
  lead_source: string;
  notes: string;
  next_follow_up: string;
  last_contact_date: string;
  crm_company_id: string;
}

const initialFormData: ContactFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  mobile: "",
  position: "",
  department: "",
  status: "new",
  priority: "medium",
  lead_source: "",
  notes: "",
  next_follow_up: "",
  last_contact_date: "",
  crm_company_id: ""
};

interface CrmCompany {
  id: string;
  name: string;
}

export default function CrmContactForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchCompanies();
    if (isEdit && id) {
      fetchContact(id);
    }
  }, [id, isEdit]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("crm_companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchContact = async (contactId: string) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("crm_contacts")
        .select("*")
        .eq("id", contactId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          mobile: data.mobile || "",
          position: data.position || "",
          department: data.department || "",
          status: data.status || "new",
          priority: data.priority || "medium",
          lead_source: data.lead_source || "",
          notes: data.notes || "",
          next_follow_up: data.next_follow_up || "",
          last_contact_date: data.last_contact_date || "",
          crm_company_id: data.crm_company_id || "none"
        });
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
      toast({
        title: "Error",
        description: "Failed to load contact data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        crm_company_id: formData.crm_company_id === "none" ? null : formData.crm_company_id || null,
        next_follow_up: formData.next_follow_up || null,
        last_contact_date: formData.last_contact_date || null
      };

      if (isEdit && id) {
        const { error } = await (supabase as any)
          .from("crm_contacts")
          .update(submitData)
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact updated successfully"
        });
      } else {
        const { error } = await (supabase as any)
          .from("crm_contacts")
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact created successfully"
        });
      }
      
      navigate("/admin/crm/contacts");
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = (companyId: string, companyName: string) => {
    // Add new company to the list
    setCompanies(prev => [...prev, { id: companyId, name: companyName }]);
    // Select the new company
    setFormData(prev => ({ ...prev, crm_company_id: companyId }));
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && isEdit) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/crm/contacts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.actions.cancel')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? t('crm.contacts.editContact') : t('crm.contacts.addNew')}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? t('crm.contacts.editContact') : t('crm.contacts.addNew')}
          </CardTitle>
          <CardDescription>
            Fill in the contact information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t('crm.contacts.fields.firstName')} *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t('crm.contacts.fields.lastName')} *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('crm.contacts.fields.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('crm.contacts.fields.phone')}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">{t('crm.contacts.fields.mobile')}</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="+49 987 654321"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">{t('crm.contacts.fields.company')}</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={formData.crm_company_id} onValueChange={(value) => handleInputChange('crm_company_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No company</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateCompanyDialogOpen(true)}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Create new company</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">{t('crm.contacts.fields.position')}</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">{t('crm.contacts.fields.department')}</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Department"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Tracking */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status & Tracking</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="status">{t('crm.contacts.fields.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t('crm.contacts.status.new')}</SelectItem>
                      <SelectItem value="contacted">{t('crm.contacts.status.contacted')}</SelectItem>
                      <SelectItem value="qualified">{t('crm.contacts.status.qualified')}</SelectItem>
                      <SelectItem value="proposal">{t('crm.contacts.status.proposal')}</SelectItem>
                      <SelectItem value="negotiation">{t('crm.contacts.status.negotiation')}</SelectItem>
                      <SelectItem value="won">{t('crm.contacts.status.won')}</SelectItem>
                      <SelectItem value="lost">{t('crm.contacts.status.lost')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t('crm.contacts.fields.priority')}</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('crm.contacts.priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('crm.contacts.priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('crm.contacts.priority.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">{t('crm.contacts.fields.leadSource')}</Label>
                  <Input
                    id="lead_source"
                    value={formData.lead_source}
                    onChange={(e) => handleInputChange('lead_source', e.target.value)}
                    placeholder="Website, referral, event, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_contact_date">{t('crm.contacts.fields.lastContactDate')}</Label>
                  <Input
                    id="last_contact_date"
                    type="date"
                    value={formData.last_contact_date}
                    onChange={(e) => handleInputChange('last_contact_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_follow_up">{t('crm.contacts.fields.nextFollowUp')}</Label>
                  <Input
                    id="next_follow_up"
                    type="date"
                    value={formData.next_follow_up}
                    onChange={(e) => handleInputChange('next_follow_up', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('crm.contacts.fields.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : t('crm.actions.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/crm/contacts")}
              >
                {t('crm.actions.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Create Company Dialog */}
      <CreateCompanyDialog
        open={createCompanyDialogOpen}
        onOpenChange={setCreateCompanyDialogOpen}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}