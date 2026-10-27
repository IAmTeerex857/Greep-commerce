import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { AppMarquee, Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Merchants } from "@/components/sections/Merchants";
import { Features } from "@/components/sections/Features";
import { Bricks } from "@/components/sections/Bricks";
import { Flywheel } from "@/components/sections/Flywheel";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Page() {
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
      <FAQ />
      <FinalCTA />
    </main>
  );
}
