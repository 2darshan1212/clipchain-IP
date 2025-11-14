import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, TrendingUp, DollarSign, Music, Play, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your episodes, clips, and earnings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Clips Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">68</div>
              <p className="text-xs text-muted-foreground mt-1">Avg 5.6 per episode</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clips Licensed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-success mt-1">+8 this week</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-warm text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/80">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$486.20</div>
              <p className="text-xs text-white/80 mt-1">+$124.50 this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="episodes" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="clips">Clips</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-6">
            {/* Upload Section */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New Episode
                </CardTitle>
                <CardDescription>
                  Upload your podcast episode and let AI create engaging clips automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop your audio file here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports MP3, WAV, OGG up to 500MB
                  </p>
                  <Button className="bg-primary hover:bg-primary-hover">
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Episodes List */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recent Episodes</CardTitle>
                <CardDescription>Your uploaded podcast episodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Building the Future of AI", status: "processed", clips: 8, earnings: "$124.50" },
                  { title: "Web3 and the Creator Economy", status: "processing", clips: 0, earnings: "$0.00" },
                  { title: "Startup Lessons from the Trenches", status: "processed", clips: 6, earnings: "$89.30" },
                ].map((episode, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Music className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{episode.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {episode.status === "processing" ? (
                            <span className="text-info">Processing...</span>
                          ) : (
                            <span>{episode.clips} clips • {episode.earnings} earned</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clips" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>AI-Generated Clips</CardTitle>
                <CardDescription>Review and approve clips created by our AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-video bg-gradient-subtle flex items-center justify-center">
                        <Play className="h-12 w-12 text-primary" />
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-sm">The Key to Building Great Products</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>1:24</span>
                          <span className="text-success">Licensed 3x</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" className="flex-1 bg-primary hover:bg-primary-hover">
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Earnings Overview
                </CardTitle>
                <CardDescription>Track your revenue and payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-2xl font-bold">$124.50</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Available</p>
                    <p className="text-2xl font-bold text-success">$486.20</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Lifetime</p>
                    <p className="text-2xl font-bold">$2,148.90</p>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary-hover">
                  <Download className="mr-2 h-4 w-4" />
                  Request Payout
                </Button>

                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Transactions</h3>
                  {[
                    { clip: "AI Product Strategy", amount: "$2.50", date: "2 hours ago" },
                    { clip: "Web3 Creator Tools", amount: "$5.00", date: "1 day ago" },
                    { clip: "Startup Fundraising Tips", amount: "$3.20", date: "3 days ago" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">{tx.clip}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                      <p className="font-semibold text-success">{tx.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>Track your content performance and growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Clip Approval Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">License Conversion</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Engagement Score</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <div className="h-64 rounded-lg bg-gradient-subtle flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
