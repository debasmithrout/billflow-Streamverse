import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrendingCarousel from "../components/landing/TrendingCarousel";
import ContentUniverse from "../components/landing/ContentUniverse";
import FeaturedOriginals from "../components/landing/FeaturedOriginals";
import DevicesSection from "../components/landing/DevicesSection";
import Services from "../components/landing/Services";
import Features from "../components/landing/Features";
import PlatformStats from "../components/landing/PlatformStats";
import PricingPreview from "../components/landing/PricingPreview";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div style={{ background: "#060816", color: "#f1f5f9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* 1. Navbar */}
      <Navbar />

      <main>
        {/* 2. Hero — email pre-fill → navigate("/register", { state: { email } }) */}
        <Hero />

        {/* 3. Trending This Week — gradient placeholder cards */}
        <TrendingCarousel />

        {/* 4. Explore Content Universe */}
        <ContentUniverse />

        {/* 5. Featured Originals */}
        <FeaturedOriginals />

        {/* 6. Watch On Every Device */}
        <DevicesSection />

        {/* 7. Why Users Love Us */}
        <Services />

        {/* 8. Smart Subscription Experience */}
        <Features />

        {/* 9. Platform Statistics — animated counters */}
        <PlatformStats />

        {/* 10. Pricing Section — GET /plans/ (UNTOUCHED) */}
        <PricingPreview />

        {/* 11. Testimonials */}
        <Testimonials />

        {/* 12. FAQ */}
        <FAQ />
      </main>

      {/* 13. Footer */}
      <Footer />
    </div>
  );
}
