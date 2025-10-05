"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import {
  getManufacturingOrders,
  ManufacturingOrder,
} from "@/api/manufacturingOrders";
import { listWorkOrders, WorkOrderListItem } from "@/api/workOrders";
import { toast } from "sonner";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export default function DashboardPage() {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [wos, setWos] = useState<WorkOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mosResp, wosResp] = await Promise.all([
          getManufacturingOrders(),
          listWorkOrders(),
        ]);
        setMos(mosResp);
        setWos(wosResp);
      } catch (e) {
        console.error("Failed to load analytics data", e);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // MOs per Month from createdAt
  const moPerMonth = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const counts = new Array(12).fill(0);
    for (const mo of mos) {
      const d = new Date(mo.createdAt);
      const m = d.getMonth();
      if (!Number.isNaN(m)) counts[m] += 1;
    }
    return counts.map((count, idx) => ({ month: monthNames[idx], count }));
  }, [mos]);

  // BOM vs Manual ratio from bomId
  const creationRatio = useMemo(() => {
    const total = mos.length || 1;
    const bomCount = mos.filter((m) => m.bomId != null).length;
    const bomPct = Math.round((bomCount / total) * 100);
    return [
      { name: "BOM", value: bomPct, fill: "hsl(var(--primary))" },
      { name: "Manual", value: 100 - bomPct, fill: "hsl(var(--muted))" },
    ];
  }, [mos]);

  // Top components aggregated from MO components
  const topComponents = useMemo(() => {
    const map = new Map<string, number>();
    for (const mo of mos) {
      if (Array.isArray(mo.components)) {
        for (const c of mo.components) {
          const key = c.material_name || "Unknown";
          const qty = Number(c.qty) || 0;
          map.set(key, (map.get(key) || 0) + qty);
        }
      }
    }
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [mos]);

  // Average lead time per stage from work orders (group by stepName)
  const leadTimeStages = useMemo(() => {
    const sums = new Map<string, { total: number; n: number }>();
    for (const wo of wos) {
      const name = wo.stepName || "Unknown";
      const time = Number(wo.estimatedTime) || 0;
      const rec = sums.get(name) || { total: 0, n: 0 };
      rec.total += time;
      rec.n += 1;
      sums.set(name, rec);
    }
    const arr = Array.from(sums.entries()).map(([name, { total, n }]) => ({
      name,
      minutes: Math.round(total / Math.max(n, 1)),
    }));
    arr.sort((a, b) => b.minutes - a.minutes);
    return arr.slice(0, 5);
  }, [wos]);

  const totalMOs = useMemo(
    () => moPerMonth.reduce((a, b) => a + b.count, 0),
    [moPerMonth]
  );

  const bomPercentage = creationRatio[0].value;
  const avgLeadTime = leadTimeStages.length
    ? Math.round(
        leadTimeStages.reduce((a, b) => a + b.minutes, 0) /
          leadTimeStages.length
      )
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Badge variant="secondary">{loading ? "Loading" : "Live (API)"}</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total MOs (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMOs}</div>
            <div className="text-xs text-muted-foreground">
              Across {moPerMonth.length} months
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>BOM-created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bomPercentage}%</div>
            <div className="text-xs text-muted-foreground">Of all MOs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manual-created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{100 - bomPercentage}%</div>
            <div className="text-xs text-muted-foreground">Of all MOs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Lead Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgLeadTime}m</div>
            <div className="text-xs text-muted-foreground">Across stages</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MOs per Month bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total MOs per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "MOs", color: "hsl(var(--primary))" },
              }}
              className="w-full h-[300px]"
            >
              <BarChart data={moPerMonth}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BOM vs Manual Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                BOM: { label: "BOM", color: "hsl(var(--primary))" },
                Manual: { label: "Manual", color: "hsl(var(--muted))" },
              }}
              className="w-full h-[300px]"
            >
              <PieChart>
                <Pie
                  data={creationRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {creationRatio.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--color-${entry.name})`}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Components */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Used Components / Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Quantity", color: "hsl(var(--primary))" },
              }}
              className="w-full h-[250px]"
            >
              <BarChart data={topComponents} layout="vertical">
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Average Lead Time per Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Average Lead Time per Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                minutes: { label: "Time (m)", color: "hsl(var(--primary))" },
              }}
              className="w-full h-[250px]"
            >
              <BarChart data={leadTimeStages} layout="vertical">
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={80}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}m`, "Time"]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="minutes"
                  fill="var(--color-minutes)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
