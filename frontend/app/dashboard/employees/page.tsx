"use client";

import { useEffect, useState } from "react";
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
import { Search, Eye, AlertTriangle, FileText, Plus } from "lucide-react";
import { EmployeeDetailsModal } from "@/components/employee-details-modal";
import { fetchEmployees } from "@/helpers/api-communicators";
import { MissingDocsModal } from "@/components/missing-docs-modal";
import { set } from "date-fns";
import { RequiredDocsModal } from "@/components/required-docs-modal";
import { EmployeeActions } from "@/components/employee-actions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Authcontext";
import formatDate from "@/lib/dateFormatter";
import { EmployeeEditModal } from "@/components/employee-edit-modal";

type Employee = {
  id: string;
  name: string;
  created_at: string;
  department: string;
  document_count: number;
  hasMissingDocs?: boolean;
  designation: string;
  grade: string;
  status: string;
};

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showRequiredDocsModal, setShowRequiredDocsModal] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    async function getEmployee() {
      try {
        const data = await fetchEmployees();
        setEmployees(data.users);
      } catch (error) {
        console.log(error);
      }
    }

    getEmployee();
  }, [selectedEmployee]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeDetailsClick = (e: React.MouseEvent, employee: any) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleUpdateEmployee = (updatedEmployee: any) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)));
    setShowEditModal(false);
  };

  const handleRequiredDocsClick = (e: React.MouseEvent, employee: any) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowRequiredDocsModal(true);
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setShowEmployeeDetails(false);
    setShowRequiredDocsModal(false);
  };

  const handleAddNewEmployee = () => {
    router.push("/dashboard/employees/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee List</h1>
          <p className="text-muted-foreground">View and manage employee documents</p>
        </div>
        {auth?.user?.role == "admin" && (
          <Button onClick={handleAddNewEmployee} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add New Employee
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{formatDate(employee.created_at)}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.grade}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>{employee.document_count}</TableCell>
                  <TableCell>
                    <EmployeeActions
                      employee={employee}
                      onViewDetails={(e) => handleEmployeeDetailsClick(e, employee)}
                      onRequiredDocs={(e) => handleRequiredDocsClick(e, employee)}
                      onEdit={() => handleEditClick(employee)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

      {selectedEmployee && showEditModal && (
        <EmployeeEditModal
          employee={selectedEmployee}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateEmployee}
        />
      )}

      {/* Beta */}
      {/* {selectedEmployee && showMissingDocsModal && (
  <MissingDocsModal
    employee={selectedEmployee}
    isOpen={showMissingDocsModal}
    onClose={handleClose}
  />
)} */}
    </div>
  );
}
