import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const WriteReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Share Your Experience</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your insights help the community grow. Choose the type of review you'd like to submit.
            </p>
          </div>

          {/* Review Type Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8 card-glow">
              <h3 className="text-2xl font-bold mb-3">Placement Process Review</h3>
              <p className="text-muted-foreground mb-4">
                Share your interview and assessment experience.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Detail the assessment tests, coding rounds, and interviews you went through. Your review will help others prepare effectively.
              </p>
              <Link to="/write/placement">
                <Button className="w-full gap-2">
                  Start Writing <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 card-glow">
              <h3 className="text-2xl font-bold mb-3">Work Experience Review</h3>
              <p className="text-muted-foreground mb-4">
                Share insights about your job and the company culture.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Describe your role, work-life balance, learning opportunities, and the overall environment. Help others make informed career choices.
              </p>
              <Link to="/write/work">
                <Button className="w-full gap-2">
                  Start Writing <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WriteReview;
