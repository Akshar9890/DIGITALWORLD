import { Shield, Target, Users, Award, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const stats = [
  { label: "Years of Experience", value: "10+", icon: Award },
  { label: "Installations Completed", value: "5,000+", icon: CheckCircle2 },
  { label: "Industries Served", value: "50+", icon: Users },
  { label: "Products Certified", value: "20+", icon: Shield },
];

const values = [
  {
    title: "Safety First",
    description:
      "Every product we design and distribute is built to protect critical infrastructure. We never compromise on quality standards.",
    icon: Shield,
  },
  {
    title: "Engineering Excellence",
    description:
      "Our heat aerosol technology is backed by rigorous R&D and third-party testing. We engineer solutions that work when they matter most.",
    icon: Target,
  },
  {
    title: "Trusted Partnerships",
    description:
      "From single-panel protection to enterprise-wide deployments, we work alongside electrical contractors, facility managers, and distributors across India.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      {/* Hero */}
      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-16">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <Shield size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              About DigitalWorld
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface mb-4">
            Protecting India&apos;s Critical Infrastructure
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            DigitalWorld Industrial is a specialist distributor of advanced heat aerosol fire
            suppression systems, serving electrical contractors, facility managers, and industrial
            enterprises across India.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="page-container max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/15 text-primary-container">
                  <stat.icon size={22} />
                </div>
                <span className="stat-value block">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 border-t border-outline-variant/10">
        <div className="page-container max-w-4xl">
          <h2 className="font-headline-md text-on-surface mb-6">Our Story</h2>
          <div className="flex flex-col gap-4 text-body-lg text-on-surface-variant leading-relaxed">
            <p>
              Founded in Mumbai, DigitalWorld Industrial emerged from a simple observation: India&apos;s
              rapidly growing industrial sector needed reliable, affordable fire protection for
              electrical infrastructure. Traditional suppression methods — gas cylinders, water
              sprinklers, and chemical extinguishers — were either too bulky, too corrosive, or too
              slow to respond for enclosed electrical environments.
            </p>
            <p>
              We introduced heat aerosol fire suppression technology to the Indian market, bringing
              compact, residue-free, and instantly activated protection devices designed specifically
              for electrical panels, server racks, switchboards, and battery cabinets. Our products
              operate without pressure vessels, piping, or manual intervention — they activate
              automatically when ambient temperature reaches 170°C.
            </p>
            <p>
              Today, we serve over 5,000 installations across manufacturing plants, data centres,
              power substations, commercial buildings, and infrastructure projects throughout India.
              Our wholesale partner network includes electrical contractors, distributors, and
              facility management companies who trust our products to protect their clients&apos;
              most valuable assets.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-t border-outline-variant/10">
        <div className="page-container max-w-6xl">
          <h2 className="font-headline-md text-on-surface mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bento-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container">
                  <value.icon size={24} />
                </div>
                <h3 className="font-headline-sm text-on-surface mb-3">{value.title}</h3>
                <p className="text-body-technical text-on-surface-variant">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-outline-variant/10">
        <div className="page-container max-w-2xl text-center">
          <h2 className="font-headline-md text-on-surface mb-4">Ready to Protect Your Infrastructure?</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Whether you need a single device or a multi-site deployment, our team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalog">
              <Button size="lg" className="gap-2">
                BROWSE CATALOG <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                CONTACT US
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
