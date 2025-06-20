"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast, useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/Authcontext";
import { createEmployee } from "@/helpers/api-communicators";

// Document categories
const documentCategories = [
  { id: "ofd", label: "OFD-Offer Document" },
  { id: "bod", label: "BOD-BioData" },
  { id: "mtr", label: "MTR-Medical Test Report at Joining" },
  { id: "jor", label: "JOR-Joining Report" },
  { id: "dob", label: "DOB-Date of Birth Certificate" },
  { id: "qal", label: "QAL-Qualifications" },
  { id: "cst", label: "CST-Caste Certificate" },
  { id: "dsc", label: "DSC-Disability Certificate" },
  { id: "atf", label: "ATF-Attestation Form" },
  { id: "nom", label: "NOM-PF/Gratuity Nomination" },
  { id: "chs", label: "CHS-Charge Sheet" },
  { id: "orp", label: "ORP-Order Passed(DA)" },
  { id: "awd", label: "AWD-Rewards/Awards" },
  { id: "ors", label: "ORS-Order of Selection against Internal Posts" },
  { id: "ism", label: "ISM-Incentive for Small Family" },
  { id: "ipq", label: "IPQ-Incentive for Professional Qualification" },
  { id: "pro", label: "PRO-All Promotion Orders" },
  { id: "cnm", label: "CNM-Change of Name" },
  { id: "ito", label: "ITO-Interplant Transfer Order" },
  { id: "dpl", label: "DPL-Dependent List" },
  { id: "adr", label: "ADR-Home Town/Present Address" },
  { id: "pfx", label: "PFX-Pay Fixation Order" },
  { id: "jud", label: "JUD-Judicial Document" },
];

// Departments
const departments = ["IT", "HR", "Finance", "Marketing", "Operations"];

// Storage locations
const storageLocations = [
  { id: "HR department", label: "HR Department" },
  { id: "Audit Room", label: "Audit Room" },
  { id: "Vigilence", label: "Vigilance" },
  { id: "Others", label: "Others" },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [joinDate, setJoinDate] = useState<Date | undefined>(undefined);
  const [department, setDepartment] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [storageLocation, setStorageLocation] = useState("");
  const [designation, setDesignation] = useState("");
  const [grade, setGrade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  useEffect(() => {
    // Check if user is logged in and has proper role
    if (auth?.user) {
      if (auth.user.role !== "admin") {
        // Show toast notification for unauthorized access
        toast({
          title: "Access Denied",
          description: "Only administrators can add new employees",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    } else if (auth?.isLoggedIn === false) {
      // Handle not logged in case
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [auth, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !joinDate || !department || !id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map selected document IDs to their labels for the API
      const requiredDocs = selectedDocuments
        .map((id) => {
          const doc = documentCategories.find((doc) => doc.id === id);
          return doc?.label || "";
        })
        .filter((label) => label !== "");

      // Format date for API
      const formattedJoinDate = joinDate ? format(joinDate, "yyyy-MM-dd") : "";

      // Call the API to create employee
      const response = await createEmployee({
        id,
        name,
        department,
        joinDate: formattedJoinDate,
        fileLocation: storageLocation || undefined,
        requireddocs: requiredDocs,
        designation,
        grade
      });

      toast({
        title: "Employee Created",
        description: `Employee ${name} has been created successfully with ID: ${response.employeeId}`,
      });

      // Redirect to employees page
      router.push(`/dashboard/employees`);
    } catch (error) {
      console.error("Error creating employee:", error);

      toast({
        title: "Error",
        description:
          "There was an error creating the employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Employee</h1>
        <p className="text-muted-foreground">
          Create a new employee record and specify required documents
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>
              Enter the basic details of the new employee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Employee ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id"
                  placeholder="Enter Employee Id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter employee name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinDate">
                  Join Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="joinDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !joinDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {joinDate ? format(joinDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={joinDate}
                      onSelect={setJoinDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  required
                >
                  <SelectTrigger id="department">
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
            </div>

            {/* Storage Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="storageLocation">Storage Location</Label>
              <Select
                value={storageLocation}
                onValueChange={setStorageLocation}
              >
                <SelectTrigger id="storageLocation">
                  <SelectValue placeholder="Select Storage Location" />
                </SelectTrigger>
                <SelectContent>
                  {storageLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="designation">
                  Designation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="designation"
                  placeholder="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">
                  Grade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="grade"
                  placeholder="Grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                />
              </div>

            {/* Required Documents Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-medium mb-2">Required Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the documents that will be required for this employee
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentCategories.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={doc.id}
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={() => handleDocumentToggle(doc.id)}
                    />
                    <Label htmlFor={doc.id} className="cursor-pointer">
                      {doc.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/employees")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
