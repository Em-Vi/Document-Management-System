import { Eye, FileText, AlertTriangle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: string;
  name: string;
  // Add other properties as needed
}

interface EmployeeActionsProps {
  employee: Employee;
  onViewDetails?: (e: React.MouseEvent, employee: Employee) => void;
  onRequiredDocs?: (e: React.MouseEvent, employee: Employee) => void;
  onMissingDocs?: (e: React.MouseEvent, employee: Employee) => void;
  onEdit?: () => void; // Updated to not require parameters
  showMissingDocsButton?: boolean;
}

export function EmployeeActions({
  employee,
  onViewDetails,
  onRequiredDocs,
  onMissingDocs,
  showMissingDocsButton = false,
  onEdit
}: EmployeeActionsProps) {
  return (
    <div className="flex space-x-2">
      {onViewDetails && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onViewDetails(e, employee)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View details</span>
        </Button>
      )}
      
      {onRequiredDocs && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onRequiredDocs(e, employee)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <FileText className="h-4 w-4" />
          <span className="sr-only">Required documents</span>
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit} // Updated to directly call onEdit
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit employee</span>
        </Button>
      )}

      {showMissingDocsButton && onMissingDocs && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onMissingDocs(e, employee)}
          className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="sr-only">Missing documents</span>
        </Button>
      )}
    </div>
  );
}