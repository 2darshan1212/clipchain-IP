import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-podcast.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
      
      <div className="container relative py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent text-accent-foreground text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Story Protocol</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Turn Podcast Episodes Into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-warm">
                Licensed IP Assets
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Upload your episodes, let AI generate high-quality clips, and earn micropayment royalties 
              every time your content is reused. All powered by blockchain IP registration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-lg h-14 px-8 shadow-warm transition-all">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-foreground">$2.4M+</div>
                <div className="text-sm text-muted-foreground">Creator Earnings</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-foreground">150K+</div>
                <div className="text-sm text-muted-foreground">Clips Licensed</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-warm opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage} 
              alt="Professional podcast studio" 
              className="relative rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
