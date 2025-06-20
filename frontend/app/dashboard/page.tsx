"use client";

import { useState, useEffect, use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, CheckCircle, Clock, Activity, File } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/Authcontext";
import { getDashboardStats } from "@/helpers/api-communicators";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import formatDate from "@/lib/dateFormatter";

// Colors for charts
const STATUS_COLORS = {
  Active: "#10b981",
  Inactive: "#f59e0b",
  Pending: "red"
};

interface DashboardStats {
  documentCount: number;
  employeeCount: number;
  activeCount: number;
  inactiveCount: number;
  pendingCount:number,
  recentUploads: Array<{
    employee_id: string;
    uploaded_at: string;
    category: string;
    status: string;
    id: string;
  }>;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const documentStatusData = [
    { name: "Active", value: dashboardStats?.activeCount },
    { name: "Inactive", value: dashboardStats?.inactiveCount },
    { name: "Pending", value: dashboardStats?.pendingCount },
  ];

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Inactive":
        return <Clock className="h-4 w-4 text-amber-500" />;
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {auth?.user?.name || "User"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8" onClick={fetchDashboardStats}>
            <Activity className="mr-2 h-3.5 w-3.5" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ml-auto">
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.employeeCount}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.documentCount}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 text-xs"></div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inactive documents
                </CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.inactiveCount}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Documents
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.pendingCount}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 text-xs"></div>
              </CardContent>
            </Card>
          </div>

        

          {/* Charts Section */}
          <div className="flex gap-4 ">
            <Card className="col-span-3 overflow-hidden w-[70%] transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
                <CardDescription>
                  Current status of all documents
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={documentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {documentStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getStatusColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md w-[30%]">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Latest documents in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats?.recentUploads.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{doc.category}</p>
                          <Badge
                            variant={
                              doc.status === "Active"
                                ? "default"
                                : doc.status === "Inactive"
                                ? "secondary"
                                : "destructive"
                            }
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            ID: {doc.employee_id}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
