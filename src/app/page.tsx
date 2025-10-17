import HeroSection from "@/components/Index/hero-section";
import ReasonSection from "@/components/Index/reason-section";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <HeroSection  />
      <ReasonSection />
    </div>
  );
}
