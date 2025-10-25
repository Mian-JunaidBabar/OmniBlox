"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Shield, User as UserIcon, Activity, Crown, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeamApi, type TeamUser } from "@/hooks/use-team-api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const roleConfig = {
  OWNER: { label: "Owner", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Crown },
  ADMIN: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
  MANAGER: { label: "Manager", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Briefcase },
  STAFF: { label: "Staff", className: "bg-gray-100 text-gray-700 border-gray-200", icon: Users },
}

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<TeamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUser } = useTeamApi();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const userData = await getUser(params.id as string);
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Error",
          description: "Failed to load user details.",
          variant: "destructive",
        });
        router.push("/people/users");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [params.id, getUser, toast, router]);

  const renderStatusBadge = (status: string) => {
    const statusInfo = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={statusInfo?.className || "bg-gray-100 text-gray-700"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/people/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={roleInfo.className}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
              {renderStatusBadge(user.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Join Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-semibold">{formatDate(user.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">{formatDateTime(user.lastLogin)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold">{user.email}</span>
            </div>
          </CardContent>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <RoleIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{roleInfo.label}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{formatDateTime(user.lastLogin)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="pt-1">{renderStatusBadge(user.status)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="font-medium">{user.joinDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">{user.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.city}, {user.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Department */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {renderStatusBadge(user.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{user.lastActive}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{user.joinDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">{permission.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity log coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
