"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Search, Download, RefreshCcw } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchLogs } from "@/helpers/api-communicators"
import { toast } from "@/components/ui/use-toast"

// Type for log entries from the database
type LogEntry = {
  id: string;
  user_id: string;
  actionType: string;
  message: string;
  performedBy: string;
  ip_address: string;
  timestamp: string;
  status: string;
};

export default function LogReportPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [performedByFilter, setPerformedByFilter] = useState<string>("all")
  const logsPerPage = 10;

  // Action type options for filter
  const actionTypes = [
    { value: "all", label: "All Actions" },
    // User related actions
    { value: "USER_LOGIN", label: "User Login" },
    { value: "USER_LOGOUT", label: "User Logout" },
    { value: "AUTH_CHECK", label: "Auth Check" },
    { value: "USER_CREATED", label: "User Created" },
    { value: "USER_DELETED", label: "User Deleted" },
    { value: "USER_FETCH_ALL", label: "All Users Fetched" },
    { value: "USER_CREATE", label: "User Created" },
    { value: "USER_DELETE", label: "User Deleted" },
    { value: "USER_STATUS_CHANGE", label: "User Status Changed" },
    { value: "USER_PASSWORD_RESET", label: "Password Reset" },
    
    // Document related actions
  { value: "DOCUMENT_SEARCH", label: "Document Searched" },
  { value: "DOCUMENT_UPLOAD", label: "Document Uploaded" },
  { value: "DOCUMENT_VIEW", label: "Document Viewed" },
  { value: "DOCUMENT_FETCH", label: "Documents Fetched" },
  { value: "DOCUMENT_STATUS_CHANGE", label: "Document Status Changed" },
  { value: "DOCUMENT_LOCATION_UPDATE", label: "Document Location Updated" },
  { value: "DOCUMENT_CATEGORY_FETCH", label: "Document Categories Fetched" },
  { value: "DOCUMENT_CATEGORY_ADD", label: "Document Category Added" },
  { value: "DOCUMENT_CATEGORY_DELETE", label: "Document Category Deleted" }, // Add this new action type
  { value: "DOCUMENT_CATEGORY_REACTIVATE", label: "Document Category Reactivated" },
    
    // Employee related actions
    { value: "EMPLOYEE_FETCH_ALL", label: "Employees Fetched" },
    { value: "EMPLOYEE_SEARCH", label: "Employee Searched" },
  ]

  // Get unique performers for the filter
  const uniquePerformers = Array.from(new Set(logs.map((log) => log.performedBy)))
    .sort()
    .map((performer) => ({ value: performer, label: performer }))

  // Add "All Users" option at the beginning
  const performerOptions = [{ value: "all", label: "All Users" }, ...uniquePerformers]

  // Function to fetch logs with the current filters
  const loadLogs = async (resetCursor = false) => {
    setIsLoading(true);
    try {
      const filters = {
        searchTerm: searchTerm || undefined,
        actionType: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };
      
      // Use cursor unless we're resetting (e.g., when filters change)
      const currentCursor = resetCursor ? undefined : cursor;
      
      const result = await fetchLogs(currentCursor, logsPerPage, filters);
      
      // If resetting cursor, replace logs, otherwise append
      if (resetCursor) {
        setLogs(result.logs);
      } else {
        setLogs(prev => [...prev, ...result.logs]);
      }
      
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Error",
        description: "Unable to load logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs when filters change
  useEffect(() => {
    loadLogs(true); // Reset cursor when filters change
  }, [searchTerm, actionTypeFilter]);

  // Load logs when date filters change, but with a slight delay to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "MMM dd, yyyy HH:mm");
  }

  // Get badge variant based on action type
  // Get badge variant based on action type
const getActionBadgeVariant = (actionType: string) => {
  // User related actions - purple
  if (actionType.includes("USER_LOGIN") || actionType.includes("USER_LOGOUT") || actionType.includes("AUTH_CHECK")) {
    return "secondary";
  }
  // User management actions - blue
  else if (actionType.includes("USER_CREATED") || actionType.includes("USER_DELETED") || 
           actionType.includes("USER_FETCH") || actionType.includes("USER_STATUS_CHANGE") ||
           actionType.includes("USER_PASSWORD_RESET")) {
    return "default";
  }
  // Document viewing - neutral
  else if (actionType.includes("DOCUMENT_VIEW") || actionType.includes("DOCUMENT_FETCH") ||
           actionType.includes("DOCUMENT_SEARCH")) {
    return "outline";
  }
  // Document modifications - attention-grabbing
  else if (actionType.includes("DOCUMENT_STATUS") || actionType.includes("DOCUMENT_UPLOAD") ||
           actionType.includes("DOCUMENT_DELETE") || actionType.includes("DOCUMENT_LOCATION_UPDATE")) {
    return "destructive";
  }
  // Document category actions - green
  else if (actionType.includes("DOCUMENT_CATEGORY")) {
    return "success"; // Make sure you have this variant defined in your theme
  }
  // Employee actions - yellow/gold
  else if (actionType.includes("EMPLOYEE")) {
    return "warning"; // Make sure you have this variant defined in your theme
  }
  // Logs viewing/export - gray
  else if (actionType.includes("LOGS_FETCH") || actionType.includes("LOG_")) {
    return "secondary";
  }
  // Default fallback for any other actions
  else {
    return "default";
  }
}

  // Format action type for display
  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFromDate(undefined);
    setToDate(undefined);
    setActionTypeFilter("all");
  }

  // Load more logs
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadLogs(false);
    }
  };

  // Export logs as CSV
  const handleExportCSV = () => {
    const headers = ["Log ID", "User ID", "Action Type", "Message", "Performed By", "IP Address", "Timestamp"];

    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.user_id || "N/A",
          formatActionType(log.actionType),
          log.message || "N/A",
          log.performedBy,
          log.ip_address,
          formatTimestamp(log.timestamp),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `log_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log Reports</h1>
        <p className="text-muted-foreground">View and filter system activity logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by date range, action type, or search for specific entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* From Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={handleResetFilters}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Showing {logs.length} log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">Loading logs...</div>
                    </TableCell>
                  </TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.id}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.actionType)}>
                          {formatActionType(log.actionType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.performedBy}</TableCell>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No logs found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load More Button for Cursor-based Pagination */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}