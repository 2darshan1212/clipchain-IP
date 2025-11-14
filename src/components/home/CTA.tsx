import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle opacity-30" />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-12 shadow-lg">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Turn Your Podcast Into a Revenue Stream?
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join thousands of creators who are already earning from their podcast content. 
            Get started for free, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-lg h-14 px-8 shadow-warm">
              Start Creating Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8">
              Schedule Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card needed
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
