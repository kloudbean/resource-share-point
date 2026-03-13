import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield, Users, FileText } from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface DashboardHeaderProps {
  agentName: string;
  fullName: string | null;
  recoNumber: string | null;
  avatarUrl: string | null;
  initials: string;
  isAdmin: boolean;
  onLogout: () => void;
}

const DashboardHeader = ({ agentName, fullName, recoNumber, avatarUrl, initials, isAdmin, onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={remaxLogo} alt="REMAX Excellence" className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="hidden sm:block border-l border-primary-foreground/20 pl-4">
              <h1 className="font-display text-lg font-bold">Agent Portal</h1>
              <p className="text-sm text-primary-foreground/70">Welcome, {agentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/directory")} className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Directory</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/documents")} className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/admin")} className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary-foreground/10">
                  <Avatar className="h-10 w-10 border-2 border-primary-foreground/30">
                    <AvatarImage src={avatarUrl || undefined} alt={agentName} />
                    <AvatarFallback className="bg-primary-foreground text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{fullName || "Agent"}</p>
                  <p className="text-xs text-muted-foreground">{recoNumber}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/directory")}>
                  <Users className="mr-2 h-4 w-4" /> Agent Directory
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/documents")}>
                  <FileText className="mr-2 h-4 w-4" /> Documents
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
