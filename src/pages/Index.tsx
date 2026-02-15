import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PlacementStats } from "@/components/PlacementStats";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="container mx-auto md:px-4 py-12 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          <p className="text-md font-semibold">Exclusively for CET MCA Students</p>
          <h2 className="text-2xl md:text-5xl font-bold leading-tight">
            Your Guide to Campus
            <br />
            <span className="text-primary">Placement Success</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students who've been through the process. Get insights on interview rounds, assessments, and company culture.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mt-10 md:mt-14">
          {/* Card 1: For Students */}
          <div className="bg-card rounded-lg p-6 md:p-8 card-glow animated-border animate-border-beam">
            <h3 className="text-2xl font-bold mb-3">For Students</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-md">
              Preparing for placements? Read detailed reviews about interview processes, assessment patterns, coding questions and preparation tips from seniors.
            </p>
            <Link to="/companies" className="text-primary hover:underline inline-flex items-center gap-2">
              Browse Reviews <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: For Contributors */}
          <div className="bg-card rounded-lg p-6 md:p-8 card-glow animated-border animate-border-beam">
            <h3 className="text-2xl font-bold mb-3">For Contributors</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-md">
              Share your placement journey and work experience. Help the community by detailing interview rounds, company culture, and career growth.
            </p>
            <Link to="/write" className="text-primary hover:underline inline-flex items-center gap-2">
              Write a Review <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Placement Statistics */}
        <div className="mt-16 md:mt-18">
          <PlacementStats />
        </div>
        {/* <p className="text-xs text-center mt-5 text-gray-400">Developed by Zuhri Noor, 2026</p> */}
      </main>
    </div>
  );
};

export default Index;