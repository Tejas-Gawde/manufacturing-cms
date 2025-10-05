import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Particles } from "@/components/ui/particles";
import { SpinningText } from "@/components/ui/spinning-text";

export default function Home() {
  return (
    <div className="bg-background">
      <Particles
        quantity={200}
        className="absolute w-full h-full"
        color="black"
      />
      <SpinningText className="fixed bottom-20 right-20">
        Try for free - Try for free -
      </SpinningText>
      <section className="px-6 py-24 md:py-32 h-screen flex items-center justify-center">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Streamline Your Manufacturing
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            From Idea to Inventory
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Plan, execute, and track every step of production with smart BOMs,
            flexible manufacturing orders, real-time stock, and actionable
            analytics - all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard/manufacturing-orders">
                Create Manufacturing Order
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Everything you need to run production
            </h2>
            <p className="mt-2 text-muted-foreground">
              Purpose-built capabilities to plan, execute, and improve
              manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.07a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.02 3.6l.06.06c.48.48 1.17.62 1.82.33A1.65 1.65 0 0 0 10.4 2.5V2a2 2 0 1 1 4 0v.07c0 .67.39 1.27 1 1.51.65.29 1.34.15 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.48.48-.62 1.17-.33 1.82.24.61.84 1 1.51 1H22a2 2 0 1 1 0 4h-.07c-.67 0-1.27.39-1.51 1Z" />
                  </svg>
                </div>
                <CardTitle>Smart BOM Automation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Generate materials and components automatically, reduce errors,
                and standardize assemblies with reusable templates.
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="2" width="6" height="4" rx="1" />
                    <path d="M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
                  </svg>
                </div>
                <CardTitle>Manual & Flexible MO Creation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create manufacturing orders on the fly with full control over
                steps, assignees, resources, and timing.
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="M3.3 7L12 12l8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <CardTitle>Real-Time Stock & Ledger</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Always know what you have on hand. Movements are logged
                instantly and transparently across locations.
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 7h5a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h1" />
                    <circle cx="6" cy="7" r="2" />
                    <circle cx="18" cy="17" r="2" />
                  </svg>
                </div>
                <CardTitle>Production Workflow Management</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Orchestrate steps across work centers, eliminate bottlenecks,
                and keep teams aligned.
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"
                      transform="translate(7 3) scale(.6)"
                    />
                    <path d="M12 3l1.5 3 3 1.5-3 1.5L12 12l-1.5-3L7.5 7.5 10 6 12 3Z" />
                  </svg>
                </div>
                <CardTitle>AI-Powered Batch Reporting</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Summarize outcomes, yields, and downtime automatically with
                AI-assisted batch insights.
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3v18h18" />
                    <rect x="6" y="12" width="3" height="6" />
                    <rect x="11" y="9" width="3" height="9" />
                    <rect x="16" y="6" width="3" height="12" />
                  </svg>
                </div>
                <CardTitle>Analytics Dashboard & Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Monitor KPIs like throughput, lead time, and utilization — all
                in real time.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Loved by modern manufacturers
            </h2>
            <p className="mt-2 text-muted-foreground">
              Real teams. Real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-muted-foreground/20">
              <CardContent className="pt-6">
                <blockquote className="text-base md:text-lg leading-relaxed">
                  “We went from spreadsheets and delays to full visibility
                  across every order. Our lead times dropped by 28% in the first
                  quarter.”
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    AR
                  </div>
                  <div>
                    <div className="font-medium">Alex Romero</div>
                    <div className="text-sm text-muted-foreground">
                      Operations Director · Horizon Fabrication
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted-foreground/20">
              <CardContent className="pt-6">
                <blockquote className="text-base md:text-lg leading-relaxed">
                  “The stock ledger and MO tracking gave us the control we were
                  missing. Variance is down and throughput is up and
                  increasing.”
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    SJ
                  </div>
                  <div>
                    <div className="font-medium">Sofia Jiang</div>
                    <div className="text-sm text-muted-foreground">
                      Plant Manager · Apex Composites
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted-foreground/20">
              <CardContent className="pt-6">
                <blockquote className="text-base md:text-lg leading-relaxed">
                  “We finally have a single source of truth from BOM to
                  shipment. Teams coordinate better and problems surface
                  earlier.”
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    MK
                  </div>
                  <div>
                    <div className="font-medium">Marcus Klein</div>
                    <div className="text-sm text-muted-foreground">
                      Head of Operations · Nova Assemblies
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
