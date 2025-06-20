"use client"

import { useState } from "react"
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
import { Plus, Eye, AlertCircle } from "lucide-react"
import { InactiveDocsModal } from "@/components/inactive-docs-modal"

// Mock data for document categories
const mandatoryDocuments = [
  "ID Proof",
  "Address Proof",
  "Employment Contract",
  "Bank Details",
  "Tax Documents",
  "Education Certificate",
]

// Mock data for missing documents
const getMissingDocuments = (employeeId: string) => {
  // This would be fetched from an API in a real application
  return [
    { category: "ID Proof", status: "Pending" },
    { category: "Bank Details", status: "Inactive" },
    { category: "Tax Documents", status: "Inactive" },
  ]
}

// Mock data for inactive documents
const getInactiveDocuments = (employeeId: string, category: string) => {
  // This would be fetched from an API in a real application
  return [
    {
      id: "DOC123",
      category: category,
      uploadedDate: "2023-05-15",
      uploadedBy: "John Admin",
      status: "Inactive",
    },
    {
      id: "DOC124",
      category: category,
      uploadedDate: "2023-06-20",
      uploadedBy: "Sarah Manager",
      status: "Inactive",
    },
    {
      id: "DOC125",
      category: category,
      uploadedDate: "2023-07-10",
      uploadedBy: "Mike HR",
      status: "Inactive",
    },
  ]
}

interface MissingDocsModalProps {
  employee: {
    id: string
    name: string
    department: string
  }
  isOpen: boolean
  onClose: () => void
}

export function MissingDocsModal({ employee, isOpen, onClose }: MissingDocsModalProps) {
  const [missingDocs, setMissingDocs] = useState(getMissingDocuments(employee.id))
  const [showInactiveDocsModal, setShowInactiveDocsModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleViewInactiveDocs = (category: string) => {
    setSelectedCategory(category)
    setShowInactiveDocsModal(true)
  }

  const handleAddDocument = (category: string) => {
    // In a real app, this would navigate to the upload page with pre-filled data
    console.log(`Add document for ${employee.name}, category: ${category}`)
    window.location.href = `/dashboard/upload?employeeId=${employee.id}&category=${category}`
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Missing Documents for {employee.name}</DialogTitle>
            <DialogDescription>Documents that need attention for employee {employee.id}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingDocs.map((doc) => (
                    <TableRow key={doc.category}>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>
                        {doc.status === "Pending" ? (
                          <Badge variant="destructive" className="flex w-fit items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex w-fit items-center gap-1">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {doc.status === "Pending" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddDocument(doc.category)}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add document</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewInactiveDocs(doc.category)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View inactive documents</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showInactiveDocsModal && (
        <InactiveDocsModal
          employee={employee}
          category={selectedCategory}
          isOpen={showInactiveDocsModal}
          onClose={() => setShowInactiveDocsModal(false)}
          documents={getInactiveDocuments(employee.id, selectedCategory)}
          onDocumentStatusUpdate={(docId) => {
            // In a real app, this would update the document status in the database
            // and refresh the missing documents list
            console.log(`Document ${docId} marked as active`)
            // Update the missing docs list by removing the category that was just activated
            setMissingDocs(missingDocs.filter((doc) => doc.category !== selectedCategory))
            setShowInactiveDocsModal(false)
          }}
        />
      )}
    </>
  )
}

