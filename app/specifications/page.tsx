import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { media, products } from "@/lib/products-data";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Specifications & Compliance — QRR0.01G/S, QRRO-10 | DigitalWorld",
  description:
    "Full technical specifications, dimensions, thermal clearances and EN 15276 / ISO compliance data for DigitalWorld aerosol suppression devices.",
};

export default function SpecificationsPage() {
  return (
    <div className="aura min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <span className="label-caps text-gold-foreground font-semibold">Engineering Datasheet</span>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-bold text-foreground">
            Every number, on the record.
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Data reproduced directly from certified test documents and lab reports. Every batch is manufactured under ISO 9001 quality management and tested to EN 15276 standards.
          </p>
        </Reveal>

        {/* Product Spec Tables */}
        <div className="mt-12 space-y-10">
          {products.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 80}>
              <section className="glass overflow-hidden rounded-3xl shadow-glass border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 p-8">
                  <div className="min-w-0">
                    <span className="label-caps text-primary font-bold">{p.model}</span>
                    <h2 className="truncate font-display text-3xl font-bold text-foreground mt-1">{p.name}</h2>
                  </div>
                  <Link
                    href={`/products/${p.slug}`}
                    className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:shadow-lift transition-all"
                  >
                    View product &amp; order
                  </Link>
                </div>
                <dl className="grid sm:grid-cols-2">
                  {p.specs.map((s) => (
                    <div
                      key={s.label}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border/40 p-5 hover:bg-secondary/20 transition-colors"
                    >
                      <dt className="min-w-0 label-caps text-xs text-muted-foreground font-medium">{s.label}</dt>
                      <dd className="shrink-0 font-mono text-sm font-semibold text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Technical Drawings Grid */}
        <Reveal className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="glass overflow-hidden rounded-3xl shadow-glass border border-border/50 p-4">
            <p className="label-caps text-muted-foreground mb-3 px-2">Engineering Dimension Drawing</p>
            <img
              src={media.dimensions}
              alt="Dimensional drawing of the QRR0.01G/S device"
              loading="lazy"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
          <div className="glass overflow-hidden rounded-3xl shadow-glass border border-border/50 p-4">
            <p className="label-caps text-muted-foreground mb-3 px-2">Dual Nozzle Aerosol Pattern</p>
            <img
              src={media.dualNozzle}
              alt="Dual nozzle discharge pattern detail"
              loading="lazy"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
        </Reveal>

        {/* Safety & Handling Notes */}
        <Reveal className="mt-16">
          <div className="glass rounded-3xl p-8 lg:p-10 shadow-glass border border-border/50">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-5 text-gold-foreground" />
              <h2 className="font-display text-2xl font-bold text-foreground">Safety &amp; Operational Notes</h2>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground list-disc list-inside">
              <li>After discharge, do not touch the device until the metal casing has fully cooled down.</li>
              <li>Thermal clearances: Maintain <code className="font-mono text-foreground font-semibold">0.30 m for ≤ 75°C</code> and <code className="font-mono text-foreground font-semibold">0.12 m for ≤ 200°C</code> from sensitive plastics.</li>
              <li>Do not tamper, pierce, or dismantle the unit without factory authorization.</li>
              <li>Replace unit immediately following activation or upon reaching the 10-year service expiry.</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
