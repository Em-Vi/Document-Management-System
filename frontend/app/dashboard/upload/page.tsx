"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadDocuments } from "@/helpers/api-communicators";

// Document categories
const documentCategories = [
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
  // Add OTH-Others as the last option
  "OTH-Others",
];

const documentLocations = [
  "Audit Room",
  "Vigilence",
  "HR department",
  "Others",
];

export default function UploadDocumentPage() {
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState("");
  // const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [otherType, setOtherType] = useState("");
  const [otherTypeError, setOtherTypeError] = useState("");

  // Get employeeId from query parameter and set it
  useEffect(() => {
    const employeeIdParam = searchParams.get("employeeId");
    const categoryParam = searchParams.get("category");
    if (employeeIdParam) {
      setEmployeeId(employeeIdParam);
    }
    if (categoryParam) {
      const decodedCategory = decodeURIComponent(categoryParam);
      console.log("Decoded category:", decodedCategory);
      setCategory(decodedCategory);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for OTH-Others
    if (category === "OTH-Others") {
      if (!otherType.trim()) {
        setOtherTypeError("Please specify the document type");
        setStatus("error");
        setMessage("");
        return;
      }
      if (otherType.length > 30) {
        setOtherTypeError("Type must be at most 30 characters");
        setStatus("error");
        setMessage("");
        return;
      }
      if (!/^[a-zA-Z0-9 .,'-]+$/.test(otherType)) {
        setOtherTypeError("Type contains invalid characters");
        setStatus("error");
        setMessage("");
        return;
      }
    }
    setOtherTypeError("");

    if (!employeeId || !category || !file) {
      setStatus("error");
      setMessage(`Please fill in all fields and select a file`);
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      // Upload the file to the server
      const fileMetadata = await uploadDocuments(
        employeeId,
        category === "OTH-Others" ? `OTH-${otherType.trim()}` : category,
        file
      );

      setStatus("success");
      setMessage("Document uploaded successfully");

      // Reset form
      setCategory("");
      setFile(null);
      setOtherType("");

      // Reset file input
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while uploading the document");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md px-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload employee documents for verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Fill in the details and upload the document file
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {status === "success" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {status === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Document Category</Label>
                <Select value={category} onValueChange={setCategory} defaultValue={category}>
                  <SelectTrigger id="category">
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

              {/* Show otherType input if OTH-Others is selected */}
              {category === "OTH-Others" && (
                <div className="space-y-2">
                  <Label htmlFor="otherType">Specify Document Type</Label>
                  <Input
                    id="otherType"
                    value={otherType}
                    onChange={(e) => setOtherType(e.target.value)}
                    placeholder="e.g. Experience Certificate"
                    maxLength={30}
                  />
                  {otherTypeError && (
                    <p className="text-xs text-red-500">{otherTypeError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max 30 characters. Allowed: letters, numbers, spaces, . , ' -
                  </p>
                </div>
              )}

              {/* <div className="space-y-2">
                <Label htmlFor="location">File Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location of file" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: only PDF
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Uploading..." : "Upload Document"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
