import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-colors hover:text-primary">
          <Headphones className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ClipChain</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-hover transition-colors">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
