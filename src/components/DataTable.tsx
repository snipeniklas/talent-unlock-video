import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  Filter,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ColumnDef<T = any> {
  id: string;
  header: string;
  accessorKey?: string;
  accessorFn?: (row: T) => any;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  defaultVisible?: boolean;
}

export interface FilterDef {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  pagination?: boolean;
  defaultPageSize?: number;
  onRowClick?: (row: T) => void;
  storageKey?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Suchen...",
  filters = [],
  pagination = true,
  defaultPageSize = 25,
  onRowClick,
  storageKey = "datatable",
}: DataTableProps<T>) {
  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem(`${storageKey}-columns`);
    if (stored) {
      return JSON.parse(stored);
    }
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.id] = col.defaultVisible !== false;
    });
    return initial;
  });

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };
    setColumnVisibility(newVisibility);
    localStorage.setItem(`${storageKey}-columns`, JSON.stringify(newVisibility));
  };

  // Toggle sort
  const toggleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnId);
      setSortOrder("asc");
    }
  };

  // Toggle filter
  const toggleFilter = (filterId: string, value: string) => {
    const current = activeFilters[filterId] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    setActiveFilters({
      ...activeFilters,
      [filterId]: newValues,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey];
    }
    return null;
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchKey) {
      result = result.filter((row) => {
        const searchValue = row[searchKey];
        if (typeof searchValue === "string") {
          return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterId, values]) => {
      if (values.length > 0) {
        result = result.filter((row) => {
          const column = columns.find((col) => col.id === filterId);
          if (!column) return true;
          const cellValue = getCellValue(row, column);
          return values.includes(String(cellValue));
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      const column = columns.find((col) => col.id === sortBy);
      if (column) {
        result.sort((a, b) => {
          const aValue = getCellValue(a, column);
          const bValue = getCellValue(b, column);
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          let comparison = 0;
          if (typeof aValue === "string" && typeof bValue === "string") {
            comparison = aValue.localeCompare(bValue);
          } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime();
          } else {
            comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
          
          return sortOrder === "asc" ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, searchTerm, searchKey, activeFilters, sortBy, sortOrder, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? processedData.slice(startIndex, endIndex) : processedData;

  // Visible columns
  const visibleColumns = columns.filter((col) => columnVisibility[col.id] !== false);

  // Active filter count
  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, values) => sum + values.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Column Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4 mr-2" />
                Spalten
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Spalten anzeigen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={columnVisibility[column.id] !== false}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters */}
          {filters.map((filter) => (
            <DropdownMenu key={filter.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter.label}
                  {activeFilters[filter.id]?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5">
                      {activeFilters[filter.id].length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={activeFilters[filter.id]?.includes(option.value)}
                    onCheckedChange={() => toggleFilter(filter.id, option.value)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* Clear Filters */}
          {(activeFilterCount > 0 || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => toggleSort(column.id)}
                    >
                      {column.header}
                      {sortBy === column.id ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  Keine Ergebnisse gefunden.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map((column) => {
                    const value = getCellValue(row, column);
                    return (
                      <TableCell key={column.id}>
                        {column.cell ? column.cell(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Zeige {startIndex + 1}-{Math.min(endIndex, processedData.length)} von{" "}
            {processedData.length} Einträgen
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Einträge pro Seite:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Seite {currentPage} von {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
