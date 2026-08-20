import Link from "next/link";
import { BatteryCharging, Building2, Factory, Server, Train, Zap, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { media } from "@/lib/products-data";

export const metadata = {
  title: "Applications — Where Aerosol Suppression Fits | DigitalWorld",
  description:
    "Electrical panels, server racks, battery enclosures, EV chargers and machine cabinets protected by autonomous heat aerosol suppression.",
};

const cases = [
  {
    icon: Zap,
    title: "Distribution boards",
    body: "MCB banks, RCCBs, and busbar chambers where loose terminals are the most common cause of high-resistance heating and ignition.",
  },
  {
    icon: Server,
    title: "Server & network racks",
    body: "Non-conductive, residue-free aerosol suppression that will not damage delicate microprocessors, PCBs, or power supplies.",
  },
  {
    icon: BatteryCharging,
    title: "Battery & inverter enclosures",
    body: "Solar inverters, UPS backup cabinets, and lithium battery banks where thermal runaway demands an immediate autonomous response.",
  },
  {
    icon: Factory,
    title: "Machine control cabinets",
    body: "PLC and VFD drive enclosures on manufacturing lines, protected locally without expensive building-wide gas suppression.",
  },
  {
    icon: Train,
    title: "Transport & rolling stock",
    body: "Vehicle fuse boxes, EV charging stations, and locomotive equipment cabinets operating reliably from -50°C to +90°C.",
  },
  {
    icon: Building2,
    title: "Commercial risers",
    body: "Unmanned floor electrical shafts, lift motor rooms, and telecom risers that are only inspected once or twice a year.",
  },
];

export default function ApplicationsPage() {
  return (
    <div className="aura min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Header */}
        <Reveal className="max-w-3xl">
          <span className="label-caps text-gold-foreground font-semibold">Protected Scenarios</span>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-bold text-foreground">
            Anywhere a fire starts <span className="italic text-primary font-normal">inside an enclosure</span>.
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            The device protects an enclosed micro-volume — precisely where electrical fires ignite and where conventional building sprinklers arrive far too late.
          </p>
        </Reveal>

        {/* Feature Hero Image */}
        <Reveal className="mt-12">
          <div className="glass overflow-hidden rounded-[2rem] shadow-glass border border-border/50">
            <img
              src={media.panel}
              alt="Aerosol device suppressing a fire inside an industrial control panel"
              className="aspect-21/9 w-full object-cover"
            />
          </div>
        </Reveal>

        {/* 6 Cases Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <article className="glass group h-full rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift border border-border/50">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <c.icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold text-foreground">{c.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Sizing Help Box */}
        <Reveal className="mt-16">
          <div className="glass-dark grid gap-8 rounded-3xl p-10 lg:p-12 lg:grid-cols-[1.4fr_auto] lg:items-center shadow-lift">
            <div className="min-w-0">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
                Not sure how many units your panel needs?
              </h2>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Provide your enclosure dimensions (H × W × D) and our engineering team will calculate optimal 100 g/m³ suppression density.
              </p>
            </div>
            <Link
              href="/quotation"
              className="shrink-0 rounded-xl bg-gold px-7 py-3.5 text-center text-sm font-bold text-gold-foreground transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Request Sizing &amp; Quote
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
