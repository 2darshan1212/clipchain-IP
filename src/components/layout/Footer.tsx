import { Headphones } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">ClipChain</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn your podcast episodes into licensed IP assets. Every clip earns royalties automatically.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link to="/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/copyright" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Copyright</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 ClipChain. Built with Story Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
