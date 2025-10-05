import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CompanyDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [reviewCounts, setReviewCounts] = useState({ placement: 0, work_experience: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchCompany = async () => {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (companyData) {
        setCompany(companyData);

        const { data: reviews } = await supabase
          .from("reviews")
          .select("review_type")
          .eq("company_id", companyData.id)
          .eq("status", "approved");

        if (reviews) {
          const placementCount = reviews.filter((r) => r.review_type === "placement").length;
          const workCount = reviews.filter((r) => r.review_type === "work_experience").length;
          setReviewCounts({ placement: placementCount, work_experience: workCount });
        }
      }

      setLoading(false);
    };

    fetchCompany();
  }, [slug, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Company not found</h2>
          <Link to="/companies">
            <Button variant="ghost" className="neon-border">
              Back to Companies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">


        <div className="max-w-4xl mx-auto space-y-8">
          {/* Company Header */}
                  <Link to="/companies">
          <Button variant="outline" className="mb-8 neon-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
          <div className="flex items-start gap-6">
            <div className="h-14 w-14 md:w-24 md:h-24 bg-secondary rounded-lg border border-border flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {company.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{company.name}</h2>
              <p className="text-muted-foreground mb-4">{company.description || "Tech company"}</p>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>

          {/* Review Type Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link to={`/company/${slug}/placement`}>
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 card-glow group cursor-pointer animated-border animate-border-beam">
                <div className="flex items-start justify-between mb-4">
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Placement Process</h3>
                <p className="text-muted-foreground mb-2">({reviewCounts.placement}) Reviews</p>
              </div>
            </Link>

            <Link to={`/company/${slug}/work`}>
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 card-glow group cursor-pointer animated-border animate-border-beam">
                <div className="flex items-start justify-between mb-4">
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Work Experience</h3>
                <p className="text-muted-foreground mb-2">({reviewCounts.work_experience}) Reviews</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDetail;
