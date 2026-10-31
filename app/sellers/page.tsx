import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { AppMarquee, Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Merchants } from "@/components/sections/Merchants";
import { Features } from "@/components/sections/Features";
import { Bricks } from "@/components/sections/Bricks";
import { Flywheel } from "@/components/sections/Flywheel";
import { FAQ, SELLER_FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Greep for sellers | Social media gets you seen. Greep gets you sales.",
  description: "Your customers are already scrolling. Greep connects what they want to your store, so they buy straight from you.",
  openGraph: {
    title: "Greep gets you sales",
    description: "Turn the attention your products get into real sales.",
  },
};

export default function SellersPage() {
  return (
    <main>
      <Nav />
      <Hero />
      <AppMarquee />
      <Problem />
      <HowItWorks />
      <Merchants />
      <Features />
      <Bricks />
      <Flywheel />
      <FAQ items={SELLER_FAQ} />
      <FinalCTA />
    </main>
  );
}
