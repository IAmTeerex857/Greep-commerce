import { Nav, type NavLink } from "@/components/sections/Nav";
import { BuyerHero } from "@/components/buyers/BuyerHero";
import { SourceMarquee } from "@/components/buyers/SourceMarquee";
import { Feeling } from "@/components/buyers/Feeling";
import { GreepIt } from "@/components/buyers/GreepIt";
import { Currency } from "@/components/buyers/Currency";
import { Doorstep } from "@/components/buyers/Doorstep";
import { Collection } from "@/components/buyers/Collection";
import { Rewards } from "@/components/buyers/Rewards";
import { FAQ, BUYER_FAQ } from "@/components/sections/FAQ";
import { BuyerCTA } from "@/components/buyers/BuyerCTA";

const LINKS: NavLink[] = [
  { href: "#how", label: "How it works" },
  { href: "#currency", label: "Pay your way" },
  { href: "#saved", label: "Saved finds" },
];

export default function Page() {
  return (
    <main>
      <Nav links={LINKS} cta="Get started" />
      <BuyerHero />
      <SourceMarquee />
      <Feeling />
      <GreepIt />
      <Currency />
      <Doorstep />
      <Collection />
      <Rewards />
      <FAQ items={BUYER_FAQ} />
      <BuyerCTA />
    </main>
  );
}
