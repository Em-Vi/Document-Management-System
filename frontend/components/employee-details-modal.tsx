"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog as PreviewDialog,
  DialogContent as PreviewDialogContent,
  DialogHeader as PreviewDialogHeader,
  DialogTitle as PreviewDialogTitle,
  DialogDescription as PreviewDialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MapPin,
  Check,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Plus,
  Search,
  Loader2,
  FileText,
  Download,
  FileDown,
} from "lucide-react";
import {
  fetchDocumentsByEmployeeId,
  viewDocument,
  changeDocumentStatus,
  updateDocumentLocation,
  downloadEmployeeFiles,
  downloadSingleDocument,
} from "@/helpers/api-communicators";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/dateFormatter";
import { PasswordConfirmModal } from "./password-confirm-modal";
import { Document, Page, pdfjs } from "react-pdf";

// Set up PDF.js worker for react-pdf (Next.js/webpack)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


interface EmployeeDetailsModalProps {
  employee: {
    id: string;
    name: string;
    department: string;
    documentCount: number;
    file_location: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

// Available storage locations
const fileLocations = ["HR department", "Audit Room", "Vigilance", "Others"];

export function EmployeeDetailsModal({
  employee,
  isOpen,
  onClose,
}: EmployeeDetailsModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState(
    employee.file_location || ""
  );
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const fetchedDocuments = await fetchDocumentsByEmployeeId(employee.id);
        setDocuments(fetchedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [employee.id]);

  useEffect(() => {
    setSelectedLocation(employee.file_location || "");
  }, [employee.file_location]);

  // Reset page number when new file is loaded
  useEffect(() => {
    setPageNumber(1);
  }, [fileBlobUrl]);

  // Set loading state when page number changes
  useEffect(() => {
    if (fileBlobUrl) {
      setPageLoading(true);
    }
  }, [pageNumber, fileBlobUrl]);

  // Filter documents when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        (doc.id && doc.id.toLowerCase().includes(lowerSearchTerm)) ||
        (doc.category &&
          doc.category.toLowerCase().includes(lowerSearchTerm)) ||
        (doc.uploadedBy &&
          doc.uploadedBy.toLowerCase().includes(lowerSearchTerm)) ||
        (doc.file_location &&
          doc.file_location.toLowerCase().includes(lowerSearchTerm))
    );

    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const handleViewDocument = async (document: any, documentId: string) => {
    try {
      const blob = await viewDocument(documentId);
      setFileBlobUrl(URL.createObjectURL(blob)); // Set the file URL to the state
      setPreviewDialogOpen(true);
      setPreviewDocument(document);
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  const handleDownloadDocuments = () => {
    setDownloadingDocId(null);
    setPasswordModalOpen(true);
  };

  const performDownload = async () => {
    try {
      if (downloadingDocId) {
        // Single document download
        await downloadSingleDocument(downloadingDocId);

        toast({
          title: "Download Complete",
          description: "Document has been downloaded successfully.",
        });
      } else {
        // All documents download
        setIsDownloadingAll(true);

        await downloadEmployeeFiles(employee.id);

        toast({
          title: "Download Complete",
          description: `All documents for ${employee.name} have been downloaded.`,
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
      setIsDownloadingAll(false);
      setDownloadingDocId(null); // Reset the document ID
    }
  };

  const handleStatusClick = (document: any) => {
    setSelectedDocument(document);
    setStatusDialogOpen(true);
  };

  // Handling status toggle
  const handleToggleStatus = (document: any) => {
    setSelectedDocument(document);
    setStatusDialogOpen(true);
  };

  const handleDownloadDocument = async (documentId: string) => {
    setDownloadingDocId(documentId);
    setPasswordModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    // Toggle the status of the selected document
    if (!selectedDocument) return;

    const newStatus =
      selectedDocument.status === "Active" ? "Inactive" : "Active";
    setIsChanging(true);
    try {
      await changeDocumentStatus(selectedDocument.id, newStatus);
      // Update the status in the local state
      setDocuments(
        documents.map((doc) => {
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
          variant: "success", // "default", "destructive", or "success"
        });
      } else {
        toast({
          title: "Document is now Inactive",
          description: "Document status changed successfully.",
          variant: "warning", // "default", "destructive", or "success"
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

  // Handle storage location change
  const handleLocationChange = async (newLocation: string) => {
    // Set the updating state to show loading indicator
    setUpdatingLocation(employee.id);

    try {
      // Call the API to update the employee's document location
      await updateDocumentLocation(employee.id, newLocation);
      setSelectedLocation(newLocation);
      // Show success toast
      toast({
        title: "Location Updated",
        description: `Document storage location changed to ${newLocation}`,
      });
    } catch (error) {
      console.error("Error updating location:", error);

      // Show error toast
      toast({
        title: "Update Failed",
        description: "Failed to update storage location. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear the updating state
      setUpdatingLocation(null);
    }
  };

  const handleAddDocument = () => {
    // Navigate to upload page with employee ID as query parameter
    router.push(`/dashboard/upload?employeeId=${employee.id}`);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPageLoading(false);
  };

  const onPageLoadSuccess = () => {
    setPageLoading(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Employee ID
                </p>
                <p>{employee.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p>{employee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Department
                </p>
                <p>{employee.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Documents
                </p>
                <p>{documents.length}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documents</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground mr-2">
                      Storage Location:
                    </p>
                    <Select
                      value={selectedLocation}
                      onValueChange={(value: string) =>
                        handleLocationChange(value)
                      }
                      disabled={!!updatingLocation}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {fileLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updatingLocation && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                    )}
                    {employee.file_location &&
                      updatingLocation !== employee.id && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-4 w-4 text-green-500 opacity-0 transition-opacity duration-300 animate-fade-in">
                                <Check className="h-4 w-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Location updated</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                  </div>
                  <Button
                    onClick={handleAddDocument}
                    size="icon"
                    className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white"
                    aria-label="Add document"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Search bar */}
              <div className="mb-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by File ID, Category, File Location or Uploaded By..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Scrollable document table */}
              <div className="rounded-md border]">
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>File ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Uploaded Date</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>{document.id}</TableCell>
                            <TableCell>{document.category}</TableCell>
                            <TableCell>
                              {formatDate(document.uploadedAt)}
                            </TableCell>
                            <TableCell>{document.uploadedBy}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  document.status === "Active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="cursor-pointer hover:opacity-80"
                                onClick={() => handleStatusClick(document)}
                              >
                                {document.status}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDownloadDocument(document.id)
                                  }
                                  aria-label="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleViewDocument(document, document.id)
                                  }
                                  aria-label="View document"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(document)}
                                  className={
                                    document.status === "Active"
                                      ? "text-green-500 hover:text-green-700 hover:bg-green-50"
                                      : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                  }
                                  aria-label="Toggle document status"
                                >
                                  {document.status === "Active" ? (
                                    <ToggleRight className="h-4 w-4" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {searchTerm
                              ? "No matching documents found."
                              : "No documents found."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDownloadDocuments}
              disabled={isDownloadingAll || documents.length === 0}
              className="gap-2"
            >
              {isDownloadingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {isDownloadingAll ? "Downloading..." : "Download All Files"}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Document Preview Dialog */}
      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
      >
        <PreviewDialogContent className="max-w-4xl max-h-[90vh]">
          <PreviewDialogHeader>
            <PreviewDialogTitle>
              {previewDocument?.category} - {previewDocument?.id}
            </PreviewDialogTitle>
            <PreviewDialogDescription>
              Uploaded on {previewDocument?.uploadedDate} by{" "}
              {previewDocument?.uploadedBy}
            </PreviewDialogDescription>
          </PreviewDialogHeader>
          <div className=" p-4 bg-gray-100 rounded-md h-[60vh] overflow-auto">
            {/* PDF Preview using react-pdf */}
            {fileBlobUrl && (
              <div className="w-full">
                <Document
                  file={fileBlobUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div>Loading PDF...</div>}
                  error={<div>Failed to load PDF.</div>}
                >
                  <Page
                    key={`${fileBlobUrl}-${pageNumber}`}
                    pageNumber={pageNumber}
                    width={800}
                    renderMode="canvas"
                    renderTextLayer={false}
                    onLoadSuccess={onPageLoadSuccess}
                  />
                </Document>
                {numPages && numPages > 1 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageLoading || pageNumber <= 1}
                    >
                      Prev
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageNumber((p) => Math.min(numPages, p + 1))
                      }
                      disabled={pageLoading || pageNumber >= numPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {pageLoading && <div className="mt-2 text-sm text-muted-foreground">Loading page...</div>}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => handleDownloadDocument(previewDocument.id)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </div>
        </PreviewDialogContent>
      </PreviewDialog>
      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setDownloadingDocId(null); // Reset on close
        }}
        onConfirm={performDownload}
        employeeName={employee.name}
        singleFileMode={!!downloadingDocId}
      />
    </>
  );
}
