import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "companies" | "contacts";
  onImportComplete: () => void;
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
  last_contact_date: "Last Contact Date (YYYY-MM-DD)"
};

export default function CsvImportDialog({ open, onOpenChange, type, onImportComplete }: CsvImportDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const fields = type === "companies" ? companyFields : contactFields;
  const tableName = type === "companies" ? "crm_companies" : "crm_contacts";

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
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Error",
          description: "CSV file must have at least a header row and one data row",
          variant: "destructive"
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: CsvRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(rows);
      setStep(2);
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

    for (const row of csvData) {
      try {
        const mappedData: any = {};
        
        // Map CSV fields to database fields
        Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
          if (dbField && row[csvField]) {
            let value = row[csvField].trim();
            
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

        const { error } = await (supabase as any)
          .from(tableName)
          .insert([mappedData]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error("Import error:", error);
        errorCount++;
      }
    }

    setImportResults({ success: successCount, errors: errorCount });
    setImporting(false);
    setStep(3);

    if (successCount > 0) {
      onImportComplete();
    }
  };

  const resetDialog = () => {
    setStep(1);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setImportResults({ success: 0, errors: 0 });
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
                          <SelectItem value="">Skip this field</SelectItem>
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