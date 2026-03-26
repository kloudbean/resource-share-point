import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

/** Illustrative Ontario new-home HST rebate estimate — not tax advice. */
export default function HSTCalculator() {
  const [price, setPrice] = useState("");

  const result = useMemo(() => {
    const p = parseFloat(price.replace(/,/g, "")) || 0;
    if (p <= 0) return { hst: 0, rebate: 0, net: 0 };
    const hst = p * 0.13;
    const federal = Math.min(p * 0.05 * 0.36, 6300);
    const provincial = Math.min(p * 0.08 * 0.75, 24000);
    const rebate = federal + provincial;
    const net = Math.max(0, hst - rebate);
    return { hst, rebate, net };
  }, [price]);

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Calculator className="h-5 w-5 text-accent" />
          HST rebate calculator
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Illustrative estimate for new-build purchases — confirm with your accountant.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="hst-price">Purchase price (before HST)</Label>
          <Input
            id="hst-price"
            inputMode="decimal"
            placeholder="850000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">HST (13%)</p>
            <p className="font-semibold">{fmt(result.hst)}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Est. rebates</p>
            <p className="font-semibold text-green-600 dark:text-green-400">−{fmt(result.rebate)}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Net HST</p>
            <p className="font-semibold">{fmt(result.net)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
