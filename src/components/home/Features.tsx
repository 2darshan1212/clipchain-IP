import { Shield, Zap, DollarSign, Brain, Share2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "IP Registration",
    description: "Every episode and clip is registered as a blockchain IP asset on Story Protocol, protecting your ownership rights.",
  },
  {
    icon: Brain,
    title: "AI Clip Generation",
    description: "Advanced AI analyzes your episodes to detect high-value moments and automatically creates engaging clips.",
  },
  {
    icon: DollarSign,
    title: "Automatic Royalties",
    description: "Earn micropayments every time your clips are licensed and reused. Revenue splits automatically between creators.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Upload an episode and get AI-generated clips within minutes. No manual editing required.",
  },
  {
    icon: Share2,
    title: "Easy Licensing",
    description: "One-click licensing for anyone who wants to use your clips. All transactions tracked on-chain.",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track your earnings, clip performance, and audience engagement in real-time.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Monetize Your Podcast
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From upload to payout, ClipChain handles the entire process with cutting-edge AI and blockchain technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
