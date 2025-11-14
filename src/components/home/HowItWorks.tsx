import { Upload, Wand2, Coins, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Episode",
    description: "Drop your audio file or paste a YouTube URL. We handle the rest.",
    step: "01",
  },
  {
    icon: Wand2,
    title: "AI Creates Clips",
    description: "Our AI transcribes, analyzes, and extracts the most engaging moments into shareable clips.",
    step: "02",
  },
  {
    icon: Coins,
    title: "Register as IP",
    description: "Each episode and clip becomes a blockchain IP asset with automatic royalty tracking.",
    step: "03",
  },
  {
    icon: Rocket,
    title: "Earn Royalties",
    description: "Every time someone licenses your clips, you earn. Payments are automatic and transparent.",
    step: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            From Upload to Earnings in 4 Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            No complex setup, no manual work. Just upload and start earning from your podcast content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative">
                <div className="absolute -top-4 -left-4 text-6xl font-bold text-primary/10">
                  {step.step}
                </div>
                
                <div className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-warm flex items-center justify-center mb-6 shadow-warm">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
