import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Review = {
  id: string;
  position_applied_for: string;
  batch: string;
  timeline: string;
  ctc_stipend: string;
  final_offer_status: string;
  is_anonymous: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

type Round = {
  round_type: string;
  round_order: number;
  round_name: string;
  difficulty: number;
  topics_covered: string;
  sections: string;
  pass_status: string;
  tips: string;
};

export default function PlacementReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

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
        .eq("review_type", "placement")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (reviewsData) setReviews(reviewsData as any);
    }

    setLoading(false);
  };

  const loadRounds = async (reviewId: string) => {
    if (selectedReview === reviewId) {
      setSelectedReview(null);
      return;
    }

    const { data } = await supabase
      .from("placement_rounds")
      .select("*")
      .eq("review_id", reviewId)
      .order("round_order");

    if (data) {
      setRounds(data);
      setSelectedReview(reviewId);
    }
  };

  const getRoundTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      assessment: "Online Assessment",
      coding: "Coding Round",
      technical_interview: "Technical Interview",
      hr_interview: "HR Interview",
      other: "Other"
    };
    return labels[type] || type;
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

        <h1 className="text-3xl font-bold mb-2">{company.name} - Placement Process Reviews</h1>
        <p className="text-muted-foreground mb-8">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} available
        </p>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No placement reviews yet. Be the first to share your experience!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{review.position_applied_for}</CardTitle>
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
                    {review.final_offer_status && (
                      <Badge>{review.final_offer_status}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {review.ctc_stipend && (
                    <p className="text-sm mb-4">
                      <span className="font-semibold">CTC/Stipend:</span> {review.ctc_stipend}
                    </p>
                  )}
                  
                  <Button 
                    onClick={() => loadRounds(review.id)}
                    variant="outline"
                    className="w-full"
                  >
                    {selectedReview === review.id ? "Hide" : "View"} Round Details
                  </Button>

                  {selectedReview === review.id && (
                    <div className="mt-6 space-y-4">
                      {rounds.map((round, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span>Round {round.round_order}: {getRoundTypeLabel(round.round_type)}</span>
                              {round.pass_status && (
                                <Badge variant={round.pass_status === "passed" ? "default" : "secondary"}>
                                  {round.pass_status}
                                </Badge>
                              )}
                            </CardTitle>
                            {round.round_name && (
                              <p className="text-sm text-muted-foreground">{round.round_name}</p>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {round.difficulty && (
                              <div>
                                <span className="font-semibold">Difficulty:</span> {round.difficulty}/10
                              </div>
                            )}
                            {round.topics_covered && (
                              <div>
                                <span className="font-semibold">Topics:</span>
                                <p className="text-muted-foreground mt-1">{round.topics_covered}</p>
                              </div>
                            )}
                            {round.sections && (
                              <div>
                                <span className="font-semibold">Sections:</span>
                                <p className="text-muted-foreground mt-1">{round.sections}</p>
                              </div>
                            )}
                            {round.tips && (
                              <div>
                                <span className="font-semibold">Tips:</span>
                                <p className="text-muted-foreground mt-1">{round.tips}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
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
