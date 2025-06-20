"use client";
import { useRouter } from "next/navigation";
 import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, RefreshCcw, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  addDocumentCategory,
  getRequiredDocsByEmployeeId,
  viewDocument,
  deleteRequiredDocument
} from "@/helpers/api-communicators";
import { InactiveDocsModal } from "./inactive-docs-modal";

type documents = {
  id: string;
  category: string;
  category_code:string;
  status: string;
  doc_id: string;
  employee_id: string;
}[];

// Available document categories that can be added
const availableDocumentCategories = [
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

interface RequiredDocsModalProps {
  employee: {
    id: string;
    name: string;
    department: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function RequiredDocsModal({
  employee,
  isOpen,
  onClose,
}: RequiredDocsModalProps) {
  const router = useRouter();
  const [requiredDocuments, setRequiredDocuments] = useState([] as documents);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState("");
  const [isInactiveModal, setIsInactiveModal] = useState(false);

  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        const docs = await getRequiredDocsByEmployeeId(employee.id);
        setRequiredDocuments(docs);

        // Create a set of used categories (e.g. "OFD-Offer Document")
        const usedCategories = new Set(
          docs.map((d: any) => `${d.category_code}-${d.category}`)
        );

        // Filter out any categories already used
        const filtered = availableDocumentCategories.filter(
          (cat) => !usedCategories.has(cat)
        );
        setAvailableCategories(filtered);
      } catch (error) {
        console.error("Error fetching required documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch required documents. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchRequiredDocuments();
  }, [employee.id, selectedCategory]);

  const handleViewDocument = async (documentId: string) => {
   try {
         const fileUrl = await viewDocument(documentId);
         window.open(`http://localhost:5000/${fileUrl}`, "_blank");
       } catch (error) {
         console.error("Error viewing document:", error);
       }
  };

  const handleReactivateDocument = (document: any) => {
     // Store the current category in state for the inactive docs modal
  const formattedCategory = `${document.category_code}-${document.category}`;
  setCurrentCategory(formattedCategory);
  
  // Open the inactive documents modal
  setIsInactiveModal(true);
  };
  const handleRemoveDocument = async (documentId: string) => {
    setIsDeleting(documentId);
    
    try {
      await deleteRequiredDocument(documentId);
      
      // Update the local state to remove the deleted document
      setRequiredDocuments(
        requiredDocuments.filter((doc) => doc.id !== documentId)
      );
      
      // Refresh the available categories list after deletion
      const filteredCategories = [...availableCategories];
      const deletedDoc = requiredDocuments.find(doc => doc.id === documentId);
      if (deletedDoc) {
        const categoryString = `${deletedDoc.category_code}-${deletedDoc.category}`;
        // Add the category back to available categories if it's not already there
        if (!filteredCategories.includes(categoryString)) {
          filteredCategories.push(categoryString);
          setAvailableCategories(filteredCategories);
        }
      }
      
      // Show success toast
      toast({
        title: "Success",
        description: "Document category removed successfully.",
      });
    } catch (error) {
      console.error("Error removing document category:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to remove document category. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset the deleting state
      setIsDeleting(null);
    }
  };
  

  const handleAddDocument = (document: any) => {
    // Format the category as "category_code-category"
    const formattedCategory = `${document.category_code}-${document.category}`;
    
    // Navigate to upload page with both employeeId and category
    router.push(`/dashboard/upload?employeeId=${employee.id}&category=${encodeURIComponent(formattedCategory)}`);
    
    // Close the modal after navigation
    onClose();
  };

  const handleAddCategory = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a document category to add.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCategory(true);

    try {
      // Simulate API call with a delay
      await addDocumentCategory(employee.id, selectedCategory);

      setSelectedCategory("");

      // Show success toast
      toast({
        title: "Category Added",
        description: `${selectedCategory} has been added to the required documents list.`,
      });
    } catch (error) {
      console.error("Error adding category:", error);

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add document category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Required Documents for {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              These are the documents required for this employee. You can add
              new document categories or upload pending documents.
            </p>
          </div>

          {/* Add new category section */}
          <div className="mb-6 flex items-end gap-2 rounded-md border p-3">
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">
                Add New Document Category
              </p>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length > 0 ? (
                    availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No more categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddCategory}
              disabled={!selectedCategory || isAddingCategory}
              className="flex items-center gap-1"
            >
              {isAddingCategory ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Category
                </>
              )}
            </Button>
          </div>

          {/* Required documents table */}
          <div className="rounded-md border lg:max-h-80 md:max-h-48 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requiredDocuments.length > 0 ? (
                  requiredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>{document.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            document.status === "Active"
                              ? "default"
                              : document.status === "Inactive"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {document.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.status === "Active" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              onClick={() =>
                                handleViewDocument(document.doc_id!)
                              }
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveDocument(document.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : document.status === "Inactive" ? (
                          // Inactive: Add & Reactivate
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-green-600 hover:text-green-800"
                              onClick={() => handleAddDocument(document)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 y
                              text-orange-600 hover:text-orange-800"
                              onClick={() =>
                                handleReactivateDocument(document)
                              }
                            >
                              <RefreshCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveDocument(document.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-green-600 hover:text-green-800"
                              onClick={() => handleAddDocument(document)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveDocument(document.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No required documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     {/* Inactive Documents Modal */}
     {isInactiveModal && (
      <InactiveDocsModal
        employee={employee}
        category={currentCategory}
        isOpen={isInactiveModal}
        onClose={() => setIsInactiveModal(false)}
        onDocumentStatusUpdate={(_documentId) => {
          // Refresh the documents list after a document is reactivated
          const fetchRequiredDocuments = async () => {
            try {
              const docs = await getRequiredDocsByEmployeeId(employee.id);
              setRequiredDocuments(docs);
              
              // Show success toast
              toast({
                title: "Success",
                description: "Document has been reactivated successfully.",
              });
            } catch (error) {
              console.error("Error fetching required documents:", error);
            }
          };
          fetchRequiredDocuments();
          
          // Close the inactive documents modal
          setIsInactiveModal(false);
        }}
      />
    )}
  
    </>
  );
}
