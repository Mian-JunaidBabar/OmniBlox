"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Package,
  FileText,
  Warehouse,
  BarChart3,
  Settings,
} from "lucide-react";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { company } = useAuth();

  const getWorkspaceUrl = (path: string) => {
    if (!company?.workspaceUrl) return path;
    return `/${company.workspaceUrl}${path}`;
  };

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/products")))
            }
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/sales")))
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Sales & Invoices</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/inventory")))
            }
          >
            <Warehouse className="mr-2 h-4 w-4" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/reports")))
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/settings")))
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/products/new")))
            }
          >
            <Package className="mr-2 h-4 w-4" />
            <span>New Product</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(getWorkspaceUrl("/sales/new")))
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>New Invoice</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push(getWorkspaceUrl("/inventory/transfer"))
              )
            }
          >
            <Warehouse className="mr-2 h-4 w-4" />
            <span>Stock Transfer</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
