"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  Search,
  FileText,
  Eye,
  RefreshCcw,
  Download,
  Filter,
  ExternalLink,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { format, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  changeDocumentStatus,
  downloadSingleDocument,
  searchDocuments,
  searchEmployees,
  viewDocument,
} from "@/helpers/api-communicators";
import { EmployeeActions } from "@/components/employee-actions";
import { EmployeeDetailsModal } from "@/components/employee-details-modal";
import { RequiredDocsModal } from "@/components/required-docs-modal";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/dateFormatter";
import { PasswordConfirmModal } from "@/components/password-confirm-modal";

// Document categories
const documentCategories = [
  "All Categories",
  "OFD-Offer Document",
  "BOD-BioData",
  "MTR-Medical Test Report at Joining",
  "JOR-Joining Report",
  "DOB-Date of Birth Certificate",
  "QAL-Qualifications",
  "CST-Caste Certificate",
  "DSC-Disability Certificate",
  "ATF-Attestation Form",
  "NOM-PF/Gratuity Nomination",
  "CHS-Charge Sheet",
  "ORP-Order Passed(DA)",
  "AWD-Rewards/Awards",
  "ORS-Order of Selection against internal posts",
  "ISM-Incentive for Small Family",
  "IPQ-Incentive for Professional Qualification",
  "PRO-All Promotion Orders",
  "CNM-Change of Name",
  "ITO-Interplant Transfer Order",
  "DPL-Dependent List",
  "ADR-Home Town/Present Address",
  "JUD-Judicial Document",
  "PFX-Pay Fixation Orders",
];

// Document statuses
const documentStatuses = ["All Statuses", "Active", "Inactive"];

// Locations
const locations = [
  "All Locations",
  "HR department",
  "Audit Room",
  "Vigilence",
  "Others",
];

const departments = [
  "All Departments",
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
];

export default function AdvancedSearchPage() {
  // Document tab state
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [docCategory, setDocCategory] = useState("All Categories");
  const [docStatus, setDocStatus] = useState("All Statuses");
  const [docFromDate, setDocFromDate] = useState<Date | undefined>(undefined);
  const [docToDate, setDocToDate] = useState<Date | undefined>(undefined);
  const [docSearchResults, setDocSearchResults] = useState<any[]>([]);
  const [isDocLoading, setIsDocLoading] = useState(false);

  // Employee tab state
  const [empFileLocation, setEmpFileLocation] = useState("All Locations");
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [empDepartment, setEmpDepartment] = useState("All Departments");
  const [showMissingDocs, setShowMissingDocs] = useState(false);
  const [empSearchResults, setEmpSearchResults] = useState<any[]>([]);
  const [isEmpLoading, setIsEmpLoading] = useState(false);
  const [empJoinFromDate, setEmpJoinFromDate] = useState<Date | undefined>(
    undefined
  );
  const [empJoinToDate, setEmpJoinToDate] = useState<Date | undefined>(
    undefined
  );

  //actions
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isChanging, setIsChanging] = useState(false);

  // Document category filter for employees
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryStatus, setCategoryStatus] = useState<Record<string, string>>(
    {}
  );

  //actions button
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  // const [showMissingDocsModal, setShowMissingDocsModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showRequiredDocsModal, setShowRequiredDocsModal] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("documents");
  const { toast } = useToast();

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleEmployeeDetailsClick = (e: React.MouseEvent, employee: any) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleDownloadDocument = async (
    documentId: string,
    employeeId: string
  ) => {
    setDownloadingDocId(documentId);
    setPasswordModalOpen(true);
  };

  const handleRequiredDocsClick = (e: React.MouseEvent, employee: any) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowRequiredDocsModal(true);
  };
  const handleClose = () => {
    // setShowMissingDocsModal(false);
    setSelectedEmployee(null);
    setShowEmployeeDetails(false);
    setShowRequiredDocsModal(false);
  };
  // to open toggle dialog
  const handleToggleStatus = (document: any) => {
    setSelectedDocument(document);
    setStatusDialogOpen(true);
  };

  //d download handler
  const performDownload = async () => {
    try {
      if (downloadingDocId) {
        // Single document download
        await downloadSingleDocument(downloadingDocId);

        toast({
          title: "Download Complete",
          description: "Document has been downloaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error downloading the document(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingDocId(null); // Reset the document ID
    }
  };

  const handleDocSearch = async () => {
    setIsDocLoading(true);

    try {
      // Format dates for API call if they exist
      const formattedFromDate = docFromDate
        ? format(docFromDate, "yyyy-MM-dd")
        : undefined;
      const formattedToDate = docToDate
        ? format(docToDate, "yyyy-MM-dd")
        : undefined;

      const results = await searchDocuments({
        searchTerm: docSearchTerm,
        category: docCategory,
        status: docStatus,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      });

      setDocSearchResults(results);
    } catch (error) {
      console.error("Error searching documents:", error);
      // Option to show an error message to the user
      // setSearchError("Failed to retrieve documents. Please try again.");
    } finally {
      setIsDocLoading(false);
    }
  };

  // status confirmation handle
  const handleStatusConfirm = async () => {
    // Toggle the status of the selected document
    if (!selectedDocument) return;

    const newStatus =
      selectedDocument.status === "Active" ? "Inactive" : "Active";
    console.log(selectedDocument.id, newStatus);
    setIsChanging(true);
    try {
      await changeDocumentStatus(selectedDocument.id, newStatus);
      // Update the status in the local state
      setDocSearchResults(
        docSearchResults.map((doc) => {
          if (doc.id === selectedDocument.id) {
            return {
              ...doc,
              status: doc.status === "Active" ? "Inactive" : "Active",
            };
          }
          return doc;
        })
      );

      if (newStatus == "Active") {
        toast({
          title: "Document is now Active",
          description: "Document status changed successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Document is now Inactive",
          description: "Document status changed successfully.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error changing document status:", error);
      toast({
        title: "Status toggle failed",
        description: "Only one document of same category should be Active",
        variant: "destructive", // "default", "destructive", or "success"
      });
    } finally {
      setIsChanging(false);
      setStatusDialogOpen(false);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const blob = await viewDocument(documentId);
      setFileBlobUrl(URL.createObjectURL(blob))
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };
  const handleEmpSearch = async () => {
    setIsEmpLoading(true);

    try {
      // Format dates for API call if they exist
      const formattedFromDate = empJoinFromDate
        ? format(empJoinFromDate, "yyyy-MM-dd")
        : undefined;
      const formattedToDate = empJoinToDate
        ? format(empJoinToDate, "yyyy-MM-dd")
        : undefined;

      const results = await searchEmployees({
        searchTerm: empSearchTerm,
        department:
          empDepartment === "All Departments" ? undefined : empDepartment,
        fileLocation:
          empFileLocation === "All Locations" ? undefined : empFileLocation,
        missingDocuments: showMissingDocs,
        selectedCategories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        categoryStatus:
          Object.keys(categoryStatus).length > 0 ? categoryStatus : undefined,
        joinFromDate: formattedFromDate,
        joinToDate: formattedToDate,
      });

      setEmpSearchResults(results);
    } catch (error) {
      console.error("Error searching employees:", error);
      // You could add error handling UI here
    } finally {
      setIsEmpLoading(false);
    }
  };

  const resetDocFilters = () => {
    setDocSearchTerm("");
    setDocCategory("All Categories");
    setDocStatus("All Statuses");
    setDocFromDate(undefined);
    setDocToDate(undefined);
    setDocSearchResults([]);
  };

  const resetEmpFilters = () => {
    setEmpSearchTerm("");
    setEmpDepartment("All Departments");
    setEmpFileLocation("All Locations");
    setShowMissingDocs(false);
    setSelectedCategories([]);
    setCategoryStatus({});
    setEmpJoinFromDate(undefined);
    setEmpJoinToDate(undefined);
    setEmpSearchResults([]);
  };

  // Toggle category selection for employee filtering
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Remove category
        const newCategories = prev.filter((c) => c !== category);
        // Also remove from status mapping
        const newStatus = { ...categoryStatus };
        delete newStatus[category];
        return newCategories;
      } else {
        // Add category with default status "All"
        setCategoryStatus((prev) => ({ ...prev, [category]: "All" }));
        return [...prev, category];
      }
    });
  };

  // Update category status
  const updateCategoryStatus = (category: string, status: string) => {
    setCategoryStatus((prev) => ({ ...prev, [category]: status }));
  };

  // Export document search results to CSV
  const exportDocumentsToCSV = () => {
    if (docSearchResults.length === 0) return;

    const headers = [
      "Document ID",
      "Category",
      "Employee",
      "Location",
      "Upload Date",
      "Upload Time",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...docSearchResults.map((doc) =>
        [
          doc.id,
          `"${doc.category.replace(/"/g, '""')}"`, // Escape quotes in CSV
          `"${doc.employeeName} (${doc.employeeId})"`,
          doc.location,
          doc.uploadDate,
          doc.uploadTime,
          doc.status,
        ].join(",")
      ),
    ].join("\n");

    downloadCSV(
      csvContent,
      `document_search_results_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
  };

  // Export employee search results to CSV
  const exportEmployeesToCSV = () => {
    if (empSearchResults.length === 0) return;

    const headers = [
      "Employee ID",
      "Name",
      "Department",
      "Document Count",
      "Missing Documents",
      "Document Categories",
    ];

    // Define interfaces for the data structures
    interface EmployeeDocument {
      category: string;
      status: string;
    }

    interface EmployeeSearchResult {
      id: string;
      name: string;
      department: string;
      documentCount: number;
      hasMissingDocuments: boolean;
      documents: EmployeeDocument[];
    }

    const csvContent = [
      headers.join(","),
      ...empSearchResults.map((emp: EmployeeSearchResult) =>
        [
          emp.id,
          `"${emp.name.replace(/"/g, '""')}"`, // Escape quotes in CSV
          emp.department,
          emp.documentCount,
          emp.hasMissingDocuments ? "Yes" : "No",
          `"${emp.documents
            .map((doc: EmployeeDocument) => `${doc.category} (${doc.status})`)
            .join("; ")}"`,
        ].join(",")
      ),
    ].join("\n");

    downloadCSV(
      csvContent,
      `employee_search_results_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
  };

  // Helper function to download CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground">
          Search for documents and employees with advanced filters
        </p>
      </div>

      <Tabs
        defaultValue="documents"
        className="space-y-4"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Search Filters</CardTitle>
              <CardDescription>
                Use the filters below to narrow down your document search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Document Name / Employee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document ID</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search documents..."
                      className="pl-8"
                      value={docSearchTerm}
                      onChange={(e) => setDocSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Document Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Document Category
                  </label>
                  <Select value={docCategory} onValueChange={setDocCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Status</label>
                  <Select value={docStatus} onValueChange={setDocStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatuses.map((stat) => (
                        <SelectItem key={stat} value={stat}>
                          {stat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload Date From
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !docFromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {docFromDate
                          ? format(docFromDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={docFromDate}
                        onSelect={setDocFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Date To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !docToDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {docToDate ? format(docToDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={docToDate}
                        onSelect={setDocToDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={resetDocFilters}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={exportDocumentsToCSV}
                    disabled={docSearchResults.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button onClick={handleDocSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Search Results</CardTitle>
              <CardDescription>
                {docSearchResults.length > 0
                  ? `Found ${docSearchResults.length} documents matching your criteria`
                  : "Use the filters above to search for documents"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDocLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : docSearchResults.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Upload Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {docSearchResults.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            {doc.id}
                          </TableCell>
                          <TableCell>{doc.category}</TableCell>
                          <TableCell>
                            {doc.employeeName} ({doc.employeeId})
                          </TableCell>
                          <TableCell>{formatDate(doc.uploadTime)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                doc.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDownloadDocument(doc.id, doc.employeeId)
                                }
                                aria-label="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDocument(doc.id)}
                                aria-label="View document"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleStatus(doc)}
                                className={
                                  doc.status === "Active"
                                    ? "text-green-500 hover:text-green-700 hover:bg-green-50"
                                    : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                }
                                aria-label="Toggle document status"
                              >
                                {doc.status === "Active" ? (
                                  <ToggleRight className="h-4 w-4" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : docSearchTerm ||
                docCategory !== "All Categories" ||
                docStatus !== "All Statuses" ||
                docFromDate ||
                docToDate ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No documents found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No documents match your search criteria. Try adjusting your
                    filters.
                  </p>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Search for documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use the filters above to search for documents in the system.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Search Filters</CardTitle>
              <CardDescription>
                Use the filters below to narrow down your employee search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Employee searchterm */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name or ID..."
                      className="pl-8"
                      value={empSearchTerm}
                      onChange={(e) => setEmpSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={empDepartment}
                    onValueChange={setEmpDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Category Filter Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Document Categories
                  </label>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowCategoryFilter(true)}
                  >
                    <span>
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} categories selected`
                        : "Filter by document categories"}
                    </span>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">File location</label>
                  <Select
                    value={empFileLocation}
                    onValueChange={setEmpFileLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Join Date From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !empJoinFromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {empJoinFromDate
                          ? format(empJoinFromDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={empJoinFromDate}
                        onSelect={setEmpJoinFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Join Date To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !empJoinToDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {empJoinToDate
                          ? format(empJoinToDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={empJoinToDate}
                        onSelect={setEmpJoinToDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Missing Documents Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="missingDocs"
                    checked={showMissingDocs}
                    onCheckedChange={(checked) =>
                      setShowMissingDocs(checked === true)
                    }
                  />
                  <Label htmlFor="missingDocs">
                    Show only employees with missing mandatory documents
                  </Label>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={resetEmpFilters}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={exportEmployeesToCSV}
                    disabled={empSearchResults.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button onClick={handleEmpSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Search Results</CardTitle>
              <CardDescription>
                {empSearchResults.length > 0
                  ? `Found ${empSearchResults.length} employees matching your criteria`
                  : "Use the filters above to search for employees"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEmpLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : empSearchResults.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Missing Documents</TableHead>

                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empSearchResults.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">
                            {emp.id}
                          </TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.documentCount}</TableCell>
                          <TableCell>
                            {emp.hasMissingDocuments ? (
                              <Badge variant="destructive">Yes</Badge>
                            ) : (
                              <Badge variant="default">No</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <EmployeeActions
                              employee={emp}
                              onViewDetails={(e) =>
                                handleEmployeeDetailsClick(e, emp)
                              }
                              onRequiredDocs={(e) =>
                                handleRequiredDocsClick(e, emp)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : empSearchTerm ||
                empDepartment !== "All Departments" ||
                empFileLocation !== "All Locations" ||
                showMissingDocs ||
                selectedCategories.length > 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No employees found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No employees match your search criteria. Try adjusting your
                    filters.
                  </p>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Search for employees
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use the filters above to search for employees in the system.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Category Filter Dialog */}

      <Dialog open={showCategoryFilter} onOpenChange={setShowCategoryFilter}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Document Categories</DialogTitle>
            <DialogDescription>
              Select document categories and their status to filter employees
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-60 overflow-y-auto">
            <Accordion type="multiple" className="w-full">
              {documentCategories.slice(1).map((category) => (
                <AccordionItem key={category} value={category}>
                  <div className="flex items-center px-4">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="mr-2"
                    />
                    <AccordionTrigger className="py-2">
                      {category}
                    </AccordionTrigger>
                  </div>
                  <AccordionContent>
                    {selectedCategories.includes(category) && (
                      <div className="px-4 pb-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={categoryStatus[category] || "All"}
                          onValueChange={(value) =>
                            updateCategoryStatus(category, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategories([]);
                setCategoryStatus({});
              }}
            >
              Clear All
            </Button>
            <Button
              onClick={() => {
                setShowCategoryFilter(false);
                handleEmpSearch();
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Modals*/}
      {selectedEmployee && showEmployeeDetails && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          isOpen={showEmployeeDetails}
          onClose={handleClose}
        />
      )}

      {selectedEmployee && showRequiredDocsModal && (
        <RequiredDocsModal
          employee={selectedEmployee}
          isOpen={showRequiredDocsModal}
          onClose={handleClose}
        />
      )}

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <>
                  Are you sure you want to change the status to{" "}
                  <span className="font-medium">
                    {selectedDocument.status === "Active"
                      ? "Inactive"
                      : "Active"}
                  </span>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            {isChanging ? (
              <Button className="bg-green-600 opacity-75" disabled>
                Confirming...
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleStatusConfirm}
              >
                Confirm
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setDownloadingDocId(null);
        }}
        onConfirm={performDownload}
        employeeName={"this employee"}
        singleFileMode={true}
      />
    </div>
  );
}
