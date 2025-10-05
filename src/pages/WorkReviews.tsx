import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Review = {
  id: string;
  position_applied_for: string;
  batch: string;
  timeline: string;
  ctc_stipend: string;
  is_anonymous: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

type WorkDetails = {
  job_title: string;
  department: string;
  work_life_balance: number;
  learning_opportunities: string;
  culture_rating: number;
  growth_prospects: string;
  pros: string;
  cons: string;
  overall_experience: string;
};

export default function WorkReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [details, setDetails] = useState<WorkDetails | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [slug, user, navigate]);

  const fetchData = async () => {
    setLoading(true);

    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (companyData) {
      setCompany(companyData);

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles(full_name)
        `)
        .eq("company_id", companyData.id)
        .eq("review_type", "work_experience")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (reviewsData) setReviews(reviewsData as any);
    }

    setLoading(false);
  };

  const loadDetails = async (reviewId: string) => {
    if (selectedReview === reviewId) {
      setSelectedReview(null);
      return;
    }

    const { data } = await supabase
      .from("work_experience_details")
      .select("*")
      .eq("review_id", reviewId)
      .single();

    if (data) {
      setDetails(data);
      setSelectedReview(reviewId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Company not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link to={`/company/${slug}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {company.name}
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">{company.name} - Work Experience Reviews</h1>
        <p className="text-muted-foreground mb-8">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} available
        </p>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No work experience reviews yet. Be the first to share your experience!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{review.position_applied_for || "Work Experience"}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {review.is_anonymous ? "Anonymous" : review.profiles?.full_name}
                        <span>•</span>
                        <span>Batch {review.batch}</span>
                        {review.timeline && (
                          <>
                            <span>•</span>
                            <span>{review.timeline}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {review.ctc_stipend && (
                    <p className="text-sm mb-4">
                      <span className="font-semibold">CTC/Stipend:</span> {review.ctc_stipend}
                    </p>
                  )}
                  
                  <Button 
                    onClick={() => loadDetails(review.id)}
                    variant="outline"
                    className="w-full"
                  >
                    {selectedReview === review.id ? "Hide" : "View"} Experience Details
                  </Button>

                  {selectedReview === review.id && details && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Job Title</p>
                          <p className="text-muted-foreground">{details.job_title}</p>
                        </div>
                        {details.department && (
                          <div>
                            <p className="font-semibold">Department</p>
                            <p className="text-muted-foreground">{details.department}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Work-Life Balance</p>
                          <p className="text-muted-foreground">{details.work_life_balance}/10</p>
                        </div>
                        <div>
                          <p className="font-semibold">Culture Rating</p>
                          <p className="text-muted-foreground">{details.culture_rating}/10</p>
                        </div>
                      </div>

                      {details.learning_opportunities && (
                        <div>
                          <p className="font-semibold">Learning Opportunities</p>
                          <p className="text-muted-foreground mt-1">{details.learning_opportunities}</p>
                        </div>
                      )}

                      {details.growth_prospects && (
                        <div>
                          <p className="font-semibold">Growth Prospects</p>
                          <p className="text-muted-foreground mt-1">{details.growth_prospects}</p>
                        </div>
                      )}

                      {details.pros && (
                        <div>
                          <p className="font-semibold">Pros</p>
                          <p className="text-muted-foreground mt-1">{details.pros}</p>
                        </div>
                      )}

                      {details.cons && (
                        <div>
                          <p className="font-semibold">Cons</p>
                          <p className="text-muted-foreground mt-1">{details.cons}</p>
                        </div>
                      )}

                      {details.overall_experience && (
                        <div>
                          <p className="font-semibold">Overall Experience</p>
                          <p className="text-muted-foreground mt-1">{details.overall_experience}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
