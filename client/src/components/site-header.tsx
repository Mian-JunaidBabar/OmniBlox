import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Calculator,
  Bell,
  Languages,
  RefreshCw,
  X,
  Sun,
} from "lucide-react";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 p-2">
        {/* Left side */}
        <h1 className="text-base font-medium">Dashboard</h1>

        {/* Right side icons */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="default" size="icon" aria-label="Calendar">
            <Calendar className="h-5 w-5" />
          </Button>
          <Button variant="default" size="icon" aria-label="Calculator">
            <Calculator className="h-5 w-5" />
          </Button>
          <Button variant="default" size="icon" aria-label="Themes">
            <Sun className="h-5 w-5" />
          </Button>
          <Button variant="default" size="icon" aria-label="Languages">
            <Languages className="h-5 w-5" />
          </Button>
          <Button variant="icon_alert" size="icon" aria-label="Alerts">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="icon_error" size="icon" aria-label="Clear">
            <X className="h-5 w-5" />
          </Button>
          <Button variant="icon_success" size="icon" aria-label="Sync">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
