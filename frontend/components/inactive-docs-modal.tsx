"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Check, Loader2, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { fetchInactiveDocuments, viewDocument, changeDocumentStatus } from "@/helpers/api-communicators"

interface InactiveDocsModalProps {
  employee: {
    id: string
    name: string
  }
  category: string
  isOpen: boolean
  onClose: () => void
  onDocumentStatusUpdate: (documentId: string) => void
}

export function InactiveDocsModal({
  employee,
  category,
  isOpen,
  onClose,
  onDocumentStatusUpdate,
}: InactiveDocsModalProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Array<{
    id: string
    category: string
    uploadedDate: string
    uploadedBy: string
    status: string
  }>>([])

  useEffect(() => {
    const loadInactiveDocuments = async () => {
      if (!isOpen || !employee.id || !category) return;
      
      setIsLoading(true);
      try {
        const docs = await fetchInactiveDocuments(employee.id, category);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching inactive documents:", error);
        toast({
          title: "Error",
          description: "Failed to load inactive documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInactiveDocuments();
  }, [isOpen, employee.id, category]);

  const handleViewDocument = async (documentId: string) => {
     try {
          const fileUrl = await viewDocument(documentId);
          window.open(`http://localhost:5000/${fileUrl}`, "_blank");
        } catch (error) {
          console.error("Error viewing document:", error);
        }
  }

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocId(documentId)
  }

  const handleDone = async () => {
    if (!selectedDocId) {
      toast({
        title: "No document selected",
        description: "Please select a document to mark as active",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Call the API to change document status
      await changeDocumentStatus(selectedDocId, "Active");
      
      // Call the callback to update the document status
      onDocumentStatusUpdate(selectedDocId)

      toast({
        title: "Document Updated",
        description: `Document has been marked as active successfully.`,
      })
    } catch (error) {
      console.error("Error updating document:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update document status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Inactive Documents - {category}</DialogTitle>
          <DialogDescription>
            Select a document to mark as active for {employee.name} ({employee.id})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inactive documents found for this category
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File ID</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className={selectedDocId === doc.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.uploadedDate}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDocument(doc.id)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View document</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSelectDocument(doc.id)}
                            className={`${
                              selectedDocId === doc.id
                                ? "bg-green-100 text-green-700"
                                : "text-green-500 hover:text-green-700 hover:bg-green-50"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Select document</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleDone} disabled={isUpdating || !selectedDocId}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Done"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  )
}

