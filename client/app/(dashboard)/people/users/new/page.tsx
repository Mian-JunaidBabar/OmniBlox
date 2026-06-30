"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamApi, type CreateUserData, type InviteLinkResponse } from "@/hooks/use-team-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { PageError, checkRoleAccess } from "@/components/ui/page-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ChevronRight, Loader2, UserPlus, Mail, Link2, Copy, Check } from "lucide-react";

export default function CreateUserPage() {
  const [emailForm, setEmailForm] = useState<CreateUserData>({
    email: "",
    name: "",
    role: "OBSERVER",
  });
  const [linkForm, setLinkForm] = useState<{
    name: string;
    role: "ADMIN" | "MANAGER" | "OBSERVER";
  }>({
    name: "",
    role: "OBSERVER",
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<InviteLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { createUser, generateInvite } = useTeamApi();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const currentRole = (user?.role || "").toUpperCase();
  const canCreateUser = currentRole === "OWNER" || currentRole === "ADMIN";
  const canCreateAdmin = currentRole === "OWNER";

  if (!canCreateUser) {
    return <PageError type="forbidden" />;
  }

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUser(emailForm);
      toast({ title: "Invitation Sent", description: `An invitation email has been sent to ${emailForm.email}.` });
      router.push("/people/users");
    } catch (error: any) {
      let msg = error?.message || "Failed to create user.";
      if (error?.statusCode === 403) msg = "You don't have permission to create users.";
      else if (error?.statusCode === 409) msg = "A user with this email already exists.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setGenerating(true);
      setInviteLink(null);
      const result = await generateInvite({
        role: linkForm.role,
        name: linkForm.name || undefined,
      });
      setInviteLink(result);
      toast({ title: "Invite Link Created", description: "Share this link with your team member." });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to generate invite link.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Invite link copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-0.5">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/people/users" className="hover:text-foreground transition-colors">Users</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">New User</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/people/users" className="flex items-center justify-center h-8 w-8 rounded-[5px] border hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold text-foreground">New User</h1>
            <p className="text-sm text-muted-foreground">Invite a new team member</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="link" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="link" className="gap-1.5">
            <Link2 className="h-4 w-4" />
            Invite Link
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-4 w-4" />
            Email Invite
          </TabsTrigger>
        </TabsList>

        {/* Invite Link Tab */}
        <TabsContent value="link">
          <div className="border rounded-[5px] bg-card shadow-sm">
            <div className="px-5 py-[15px] border-b">
              <h2 className="text-sm font-semibold text-foreground">Generate Invite Link</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a shareable link. Send it via WhatsApp or any messenger — the recipient enters their own email and sets a password.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="link-name" className="text-xs font-medium">Name (optional)</Label>
                  <Input
                    id="link-name"
                    value={linkForm.name}
                    onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                    placeholder="John Smith"
                    className="h-[34px] rounded-[5px] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-role" className="text-xs font-medium">Role *</Label>
                  <Select
                    value={linkForm.role}
                    onValueChange={(value: "ADMIN" | "MANAGER" | "OBSERVER") =>
                      setLinkForm({ ...linkForm, role: value })
                    }
                  >
                    <SelectTrigger id="link-role" className="h-[34px] rounded-[5px] text-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN" disabled={!canCreateAdmin}>Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="OBSERVER">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGenerateLink}
                disabled={generating}
                className="h-[34px] rounded-[5px] bg-[#ff9025] hover:bg-[#ff9025]/90 text-white text-[13px] font-medium px-3 gap-1.5"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                {generating ? "Generating..." : "Generate Invite Link"}
              </Button>

              {inviteLink && (
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-medium">Share this link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={inviteLink.link}
                      className="h-[34px] rounded-[5px] text-sm font-mono text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-[34px] w-[34px] rounded-[5px] shrink-0"
                      onClick={copyLink}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires in 48 hours. The recipient will set their own name, email, and password.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Email Invite Tab */}
        <TabsContent value="email">
          <form id="create-user-form" onSubmit={handleEmailInvite}>
            <div className="border rounded-[5px] bg-card shadow-sm">
              <div className="px-5 py-[15px] border-b">
                <h2 className="text-sm font-semibold text-foreground">User Details</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      value={emailForm.name}
                      onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                      placeholder="John Smith"
                      required
                      className="h-[34px] rounded-[5px] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                      className="h-[34px] rounded-[5px] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium">Role *</Label>
                  <Select
                    value={emailForm.role}
                    onValueChange={(value: "ADMIN" | "MANAGER" | "OBSERVER") =>
                      setEmailForm({ ...emailForm, role: value })
                    }
                  >
                    <SelectTrigger id="role" className="h-[34px] rounded-[5px] text-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN" disabled={!canCreateAdmin}>Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="OBSERVER">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                    An invitation email will be sent to <strong>{emailForm.email || "the provided email"}</strong>.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Link href="/people/users">
                <Button type="button" variant="outline" size="sm" className="h-[34px] rounded-[5px] text-[13px]">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="h-[34px] rounded-[5px] bg-[#ff9025] hover:bg-[#ff9025]/90 text-white text-[13px] font-medium px-3 gap-1.5"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
