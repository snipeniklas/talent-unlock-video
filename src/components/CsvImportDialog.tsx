import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, CheckCircle, AlertCircle, List } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "companies" | "contacts";
  onImportComplete: () => void;
  // For campaign integration - preselect a list
  preselectedListId?: string;
  preselectedListName?: string;
  campaignId?: string;
}

interface CsvRow {
  [key: string]: string;
}

interface FieldMapping {
  [csvField: string]: string; // csvField -> dbField
}

const companyFields = {
  name: "Company Name *",
  website: "Website",
  industry: "Industry",
  size_category: "Company Size",
  annual_revenue: "Annual Revenue",
  phone: "Phone",
  email: "Email",
  address_street: "Street Address",
  address_city: "City",
  address_postal_code: "Postal Code",
  address_country: "Country",
  notes: "Notes",
  status: "Status"
};

const contactFields = {
  first_name: "First Name *",
  last_name: "Last Name *",
  email: "Email",
  phone: "Phone",
  mobile: "Mobile",
  position: "Position",
  department: "Department",
  status: "Status",
  priority: "Priority",
  lead_source: "Lead Source",
  notes: "Notes",
  next_follow_up: "Next Follow-up (YYYY-MM-DD)",
  last_contact_date: "Last Contact Date (YYYY-MM-DD)",
  // Company fields for automatic company creation
  company_name: "Company Name",
  company_website: "Company Website",
  company_industry: "Company Industry",
  company_size_category: "Company Size",
  company_annual_revenue: "Company Annual Revenue",
  company_phone: "Company Phone",
  company_email: "Company Email",
  company_address_street: "Company Street Address",
  company_address_city: "Company City",
  company_address_postal_code: "Company Postal Code",
  company_address_country: "Company Country",
  company_notes: "Company Notes"
};

export default function CsvImportDialog({ 
  open, 
  onOpenChange, 
  type, 
  onImportComplete,
  preselectedListId,
  preselectedListName,
  campaignId
}: CsvImportDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });
  
  // Contact list states - preselect if provided
  const [listOption, setListOption] = useState<"none" | "existing" | "new">(preselectedListId ? "existing" : "none");
  const [selectedListId, setSelectedListId] = useState<string>(preselectedListId || "");
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  
  // Reset list selection when preselectedListId changes
  useEffect(() => {
    if (preselectedListId) {
      setListOption("existing");
      setSelectedListId(preselectedListId);
    }
  }, [preselectedListId]);

  const fields = type === "companies" ? companyFields : contactFields;
  const tableName = type === "companies" ? "crm_companies" : "crm_contacts";

  // Fetch existing contact lists
  const { data: contactLists } = useQuery({
    queryKey: ['contactLists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_lists')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: type === "contacts" && open
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Use Papa Parse for robust CSV parsing with auto delimiter detection
      Papa.parse<CsvRow>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimiter: "", // Auto-detect delimiter (comma, semicolon, tab, etc.)
        complete: (results) => {
          const rows = results.data;
          const headers = results.meta.fields || [];

          // Check if parsing resulted in only 1 column - likely wrong delimiter
          if (headers.length === 1 && rows.length > 0) {
            console.error("CSV parsing detected only 1 column - delimiter issue");
            toast({
              title: "CSV Format Error",
              description: "Could not detect correct delimiter. Please ensure your CSV uses comma (,) or semicolon (;) as separator.",
              variant: "destructive"
            });
            return;
          }

          if (headers.length === 0 || rows.length === 0) {
            toast({
              title: "Error",
              description: "CSV file must have at least a header row and one data row",
              variant: "destructive"
            });
            return;
          }

          // Only show error warning if actual parsing errors occurred (not just row-level warnings)
          if (results.errors.length > 0) {
            const criticalErrors = results.errors.filter(err => err.type === 'Delimiter' || err.type === 'Quotes');
            if (criticalErrors.length > 0) {
              console.error("CSV parse errors:", results.errors);
              toast({
                title: "CSV Parse Warning",
                description: `Found ${results.errors.length} parsing issue(s). Data might be incomplete.`,
                variant: "destructive"
              });
            }
          }

          console.log(`✅ Parsed ${rows.length} rows with ${headers.length} columns:`, headers);

          setCsvHeaders(headers);
          setCsvData(rows);
          setStep(2);
        }
      });
    };
    reader.readAsText(file);
  }, [toast]);

  const handleFieldMapping = (csvField: string, dbField: string) => {
    setFieldMapping(prev => ({ ...prev, [csvField]: dbField }));
  };

  const downloadTemplate = () => {
    const headers = Object.values(fields).join(',');
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const importedContactIds: string[] = [];
    let targetListId = selectedListId;

    try {
      // Create new list if needed
      if (type === "contacts" && listOption === "new" && newListName.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive"
          });
          setImporting(false);
          return;
        }

        const { data: newList, error: listError } = await supabase
          .from('crm_contact_lists')
          .insert([{
            name: newListName,
            description: newListDescription || null,
            created_by: user.id
          }])
          .select('id')
          .single();

        if (listError) {
          toast({
            title: "Error",
            description: "Failed to create contact list",
            variant: "destructive"
          });
          setImporting(false);
          return;
        }

        targetListId = newList.id;
      }

      for (const row of csvData) {
        try {
          const mappedData: any = {};
          const companyData: any = {};
          
          // Map CSV fields to database fields
          Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
            if (dbField && dbField !== "skip" && row[csvField]) {
              let value = row[csvField].trim();
              
              // Handle company fields for contact import
              if (type === "contacts" && dbField.startsWith('company_')) {
                const companyField = dbField.replace('company_', '');
                if (companyField === 'annual_revenue' && value) {
                  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
                  companyData[companyField] = isNaN(numericValue) ? null : numericValue;
                } else {
                  companyData[companyField] = value;
                }
                return;
              }
              
              // Handle special field types
              if (dbField === 'annual_revenue' && value) {
                const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
                mappedData[dbField] = isNaN(numericValue) ? null : numericValue;
              } else if ((dbField === 'next_follow_up' || dbField === 'last_contact_date') && value) {
                // Validate date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  throw new Error(`Invalid date format for ${dbField}: ${value}`);
                }
                mappedData[dbField] = value;
              } else {
                mappedData[dbField] = value;
              }
            }
          });

          // Set default values
          if (type === "companies") {
            mappedData.status = mappedData.status || "prospect";
          } else {
            mappedData.status = mappedData.status || "new";
            mappedData.priority = mappedData.priority || "medium";
          }

          // Validate required fields
          if (type === "companies" && !mappedData.name) {
            throw new Error("Company name is required");
          }
          if (type === "contacts" && (!mappedData.first_name || !mappedData.last_name)) {
            throw new Error("First name and last name are required");
          }

          // Handle company creation for contacts
          if (type === "contacts" && companyData.name) {
            // Check if company already exists
            const { data: existingCompany } = await supabase
              .from('crm_companies')
              .select('id')
              .eq('name', companyData.name)
              .maybeSingle();

            let companyId;
            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              // Create new company
              companyData.status = companyData.status || "prospect";
              const { data: newCompany, error: companyError } = await supabase
                .from('crm_companies')
                .insert([companyData])
                .select('id')
                .single();

              if (companyError) throw companyError;
              companyId = newCompany.id;
            }

            mappedData.crm_company_id = companyId;
          }

          const { data: insertedData, error } = await supabase
            .from(tableName)
            .insert([mappedData])
            .select('id')
            .single();

          if (error) throw error;
          
          if (type === "contacts" && insertedData?.id) {
            importedContactIds.push(insertedData.id);
          }
          
          successCount++;
        } catch (error) {
          console.error("Import error:", error);
          errorCount++;
        }
      }

      // Add contacts to list if a list was selected or created
      if (type === "contacts" && targetListId && importedContactIds.length > 0) {
        const listMembers = importedContactIds.map(contactId => ({
          list_id: targetListId,
          contact_id: contactId
        }));

        const { error: listError } = await supabase
          .from('crm_contact_list_members')
          .insert(listMembers);

        if (listError) {
          console.error("Error adding contacts to list:", listError);
          toast({
            title: "Warning",
            description: "Contacts imported but some could not be added to the list",
            variant: "destructive"
          });
        }
      }

      setImportResults({ success: successCount, errors: errorCount });
      setImporting(false);
      setStep(3);

      if (successCount > 0) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import error:", error);
      setImporting(false);
      toast({
        title: "Error",
        description: "Import failed",
        variant: "destructive"
      });
    }
  };

  const resetDialog = () => {
    setStep(1);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setImportResults({ success: 0, errors: 0 });
    setListOption("none");
    setSelectedListId("");
    setNewListName("");
    setNewListDescription("");
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            CSV Import - {type === "companies" ? t('crm.companies.title') : t('crm.contacts.title')}
          </DialogTitle>
          <DialogDescription>
            Import data from a CSV file in 3 easy steps
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Step 1: Upload CSV File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Choose CSV file to import</p>
                  <p className="text-muted-foreground mb-4">
                    Select a CSV file containing your {type === "companies" ? "company" : "contact"} data
                  </p>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Button asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="text-center">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Map CSV Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Found {csvData.length} rows. Map your CSV columns to database fields:
                </p>
                
                {type === "contacts" && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      {t('crm.csvImport.companyFieldsNote')}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {csvHeaders.map((header) => (
                    <div key={header} className="space-y-2">
                      <Label>CSV Column: "{header}"</Label>
                      <Select
                        value={fieldMapping[header] || ""}
                        onValueChange={(value) => handleFieldMapping(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select database field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Skip this field</SelectItem>
                          {Object.entries(fields).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button onClick={() => setStep(1)} variant="outline">
                    Back
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={importing || Object.keys(fieldMapping).length === 0}
                  >
                    {importing ? "Importing..." : `Import ${csvData.length} Records`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact List Selection - Only for contacts */}
            {type === "contacts" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    {preselectedListId ? "Zielliste" : "Add to Contact List (Optional)"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show info banner when preselected for campaign */}
                  {preselectedListId && campaignId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        Kontakte werden zur Liste <strong>"{preselectedListName}"</strong> hinzugefügt und automatisch zur laufenden Kampagne.
                      </p>
                    </div>
                  )}
                  
                  {/* Hide list selection when preselected */}
                  {!preselectedListId && (
                    <>
                      <RadioGroup value={listOption} onValueChange={(value: any) => setListOption(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="none" />
                          <Label htmlFor="none">Don't add to any list</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="existing" id="existing" />
                          <Label htmlFor="existing">Add to existing list</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="new" />
                          <Label htmlFor="new">Create new list</Label>
                        </div>
                      </RadioGroup>

                      {listOption === "existing" && (
                        <div className="space-y-2 pl-6">
                          <Label>Select Contact List</Label>
                          <Select value={selectedListId} onValueChange={setSelectedListId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a contact list" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactLists?.map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                  {list.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {listOption === "new" && (
                        <div className="space-y-4 pl-6">
                          <div className="space-y-2">
                            <Label>List Name *</Label>
                            <Input
                              value={newListName}
                              onChange={(e) => setNewListName(e.target.value)}
                              placeholder="Enter list name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newListDescription}
                              onChange={(e) => setNewListDescription(e.target.value)}
                              placeholder="Optional description"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show selected list info when preselected */}
                  {preselectedListId && (
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-sm font-medium">{preselectedListName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                    <div className="text-sm text-green-700">Successfully imported</div>
                  </div>
                  {importResults.errors > 0 && (
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                      <div className="text-sm text-red-700">Failed to import</div>
                    </div>
                  )}
                </div>
                
                {importResults.errors > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      Some records failed to import. This is usually due to missing required fields or invalid data formats.
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={resetDialog}>
                    Import Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}