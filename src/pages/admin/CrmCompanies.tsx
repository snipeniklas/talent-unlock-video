import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Mail, Phone, Plus, Upload, Eye, Edit, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";
import CsvImportDialog from "@/components/CsvImportDialog";
import { DataTable, ColumnDef, FilterDef } from "@/components/DataTable";

interface CrmCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size_category?: string;
  annual_revenue?: number;
  phone?: string;
  email?: string;
  status: string;
  created_at: string;
}

export default function CrmCompanies() {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("crm_companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "customer":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "qualified":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "prospect":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return "-";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(revenue);
  };

  // Column definitions
  const columns: ColumnDef<CrmCompany>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
      defaultVisible: true,
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: "website",
      header: "Website",
      accessorKey: "website",
      sortable: true,
      defaultVisible: false,
      cell: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      id: "industry",
      header: "Branche",
      accessorKey: "industry",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (value) => value || "-",
    },
    {
      id: "size_category",
      header: "Größe",
      accessorKey: "size_category",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      cell: (value) => value || "-",
    },
    {
      id: "annual_revenue",
      header: "Umsatz",
      accessorKey: "annual_revenue",
      sortable: true,
      defaultVisible: true,
      cell: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          {formatRevenue(value)}
        </div>
      ),
    },
    {
      id: "email",
      header: "E-Mail",
      accessorKey: "email",
      sortable: true,
      defaultVisible: true,
      cell: (value) =>
        value ? (
          <a
            href={`mailto:${value}`}
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      id: "phone",
      header: "Telefon",
      accessorKey: "phone",
      sortable: false,
      defaultVisible: false,
      cell: (value) =>
        value ? (
          <a
            href={`tel:${value}`}
            className="flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (value) => (
        <Badge className={getStatusColor(value)}>
          {value === "customer" && "Kunde"}
          {value === "qualified" && "Qualifiziert"}
          {value === "prospect" && "Interessent"}
          {value === "inactive" && "Inaktiv"}
        </Badge>
      ),
    },
    {
      id: "created_at",
      header: "Erstellt",
      accessorKey: "created_at",
      sortable: true,
      defaultVisible: false,
      cell: (value) => new Date(value).toLocaleDateString("de-DE"),
    },
    {
      id: "actions",
      header: "Aktionen",
      sortable: false,
      defaultVisible: true,
      cell: (_, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/crm/companies/${row.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ansehen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/crm/companies/${row.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Bearbeiten
          </Button>
        </div>
      ),
    },
  ];

  // Filter definitions
  const uniqueIndustries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(companies.map((c) => c.size_category).filter(Boolean)));

  const filters: FilterDef[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Interessent", value: "prospect" },
        { label: "Qualifiziert", value: "qualified" },
        { label: "Kunde", value: "customer" },
        { label: "Inaktiv", value: "inactive" },
      ],
    },
    {
      id: "industry",
      label: "Branche",
      options: uniqueIndustries.map((industry) => ({
        label: industry!,
        value: industry!,
      })),
    },
    {
      id: "size_category",
      label: "Größe",
      options: uniqueSizes.map((size) => ({
        label: size!,
        value: size!,
      })),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CRM Unternehmen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Unternehmenskontakte und potenzielle Kunden
        </p>
      </div>

      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" onClick={() => setCsvDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          CSV Import
        </Button>
        <Button onClick={() => navigate("/admin/crm/companies/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neu anlegen
        </Button>
      </div>

      <DataTable
        data={companies}
        columns={columns}
        filters={filters}
        searchKey="name"
        searchPlaceholder="Unternehmen suchen..."
        onRowClick={(row) => navigate(`/admin/crm/companies/${row.id}`)}
        storageKey="crm-companies"
      />

      <CsvImportDialog
        open={csvDialogOpen}
        onOpenChange={setCsvDialogOpen}
        type="companies"
        onImportComplete={fetchCompanies}
      />
    </div>
  );
}
