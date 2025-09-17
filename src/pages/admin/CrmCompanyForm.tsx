import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";

interface CompanyFormData {
  name: string;
  website: string;
  industry: string;
  size_category: string;
  annual_revenue: string;
  phone: string;
  email: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  notes: string;
  status: string;
}

const initialFormData: CompanyFormData = {
  name: "",
  website: "",
  industry: "",
  size_category: "",
  annual_revenue: "",
  phone: "",
  email: "",
  address_street: "",
  address_city: "",
  address_postal_code: "",
  address_country: "",
  notes: "",
  status: "prospect"
};

export default function CrmCompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit && id) {
      fetchCompany(id);
    }
  }, [id, isEdit]);

  const fetchCompany = async (companyId: string) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("crm_companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          name: data.name || "",
          website: data.website || "",
          industry: data.industry || "",
          size_category: data.size_category || "",
          annual_revenue: data.annual_revenue?.toString() || "",
          phone: data.phone || "",
          email: data.email || "",
          address_street: data.address_street || "",
          address_city: data.address_city || "",
          address_postal_code: data.address_postal_code || "",
          address_country: data.address_country || "",
          notes: data.notes || "",
          status: data.status || "prospect"
        });
      }
    } catch (error) {
      console.error("Error fetching company:", error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      
      const submitData = {
        ...formData,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null
      };

      if (isEdit && id) {
        const { error } = await (supabase as any)
          .from("crm_companies")
          .update(submitData)
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Company updated successfully"
        });
      } else {
        const { error } = await (supabase as any)
          .from("crm_companies")
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Company created successfully"
        });
      }
      
      navigate("/admin/crm/companies");
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
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
          onClick={() => navigate("/admin/crm/companies")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.actions.cancel')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? t('crm.companies.editCompany') : t('crm.companies.addNew')}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? t('crm.companies.editCompany') : t('crm.companies.addNew')}
          </CardTitle>
          <CardDescription>
            Fill in the company information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t('crm.companies.fields.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t('crm.companies.fields.website')}</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">{t('crm.companies.fields.industry')}</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Enter industry"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size_category">{t('crm.companies.fields.sizeCategory')}</Label>
                  <Select value={formData.size_category} onValueChange={(value) => handleInputChange('size_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_revenue">{t('crm.companies.fields.annualRevenue')}</Label>
                  <Input
                    id="annual_revenue"
                    type="number"
                    value={formData.annual_revenue}
                    onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t('crm.companies.fields.status')}</Label>
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
              </div>

              {/* Contact & Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact & Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('crm.companies.fields.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('crm.companies.fields.phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_street">{t('crm.companies.fields.addressStreet')}</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    placeholder="Street and number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_postal_code">{t('crm.companies.fields.addressPostalCode')}</Label>
                    <Input
                      id="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_city">{t('crm.companies.fields.addressCity')}</Label>
                    <Input
                      id="address_city"
                      value={formData.address_city}
                      onChange={(e) => handleInputChange('address_city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_country">{t('crm.companies.fields.addressCountry')}</Label>
                  <Input
                    id="address_country"
                    value={formData.address_country}
                    onChange={(e) => handleInputChange('address_country', e.target.value)}
                    placeholder="Germany"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('crm.companies.fields.notes')}</Label>
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
                onClick={() => navigate("/admin/crm/companies")}
              >
                {t('crm.actions.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}