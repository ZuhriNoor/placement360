import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

type Company = {
  id: string;
  name: string;
  slug: string;
};

type Round = {
  round_type: "assessment" | "coding" | "technical_interview" | "hr_interview" | "other";
  round_order: number;
  round_name?: string;
  difficulty?: number;
  topics_covered?: string;
  sections?: string;
  pass_status?: "passed" | "failed" | "waiting";
  tips?: string;
};

export default function WritePlacementReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [companyId, setCompanyId] = useState("");
  const [positionAppliedFor, setPositionAppliedFor] = useState("");
  const [batch, setBatch] = useState("");
  const [timeline, setTimeline] = useState("");
  const [ctcStipend, setCtcStipend] = useState("");
  const [finalOfferStatus, setFinalOfferStatus] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([
    { round_type: "assessment", round_order: 1 }
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, slug")
        .order("name");
      
      if (data) setCompanies(data);
    };

    fetchCompanies();
  }, [user, navigate]);

  const addRound = () => {
    setRounds([...rounds, { round_type: "assessment", round_order: rounds.length + 1 }]);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const updateRound = (index: number, field: keyof Round, value: any) => {
    const updated = [...rounds];
    updated[index] = { ...updated[index], [field]: value };
    setRounds(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId || !positionAppliedFor || !batch) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .insert({
          company_id: companyId,
          author_id: user!.id,
          review_type: "placement",
          position_applied_for: positionAppliedFor,
          batch,
          timeline,
          ctc_stipend: ctcStipend,
          final_offer_status: finalOfferStatus,
          is_anonymous: isAnonymous,
          status: "pending"
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      const roundsData = rounds.map((round, index) => ({
        review_id: review.id,
        ...round,
        round_order: index + 1
      }));

      const { error: roundsError } = await supabase
        .from("placement_rounds")
        .insert(roundsData);

      if (roundsError) throw roundsError;

      toast.success("Review submitted successfully! It will be visible after admin approval.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Write Placement Process Review</h1>
          <p className="text-muted-foreground mb-8">Share your placement experience to help others</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select value={companyId} onValueChange={setCompanyId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Position Applied For *</Label>
                  <Input
                    id="position"
                    value={positionAppliedFor}
                    onChange={(e) => setPositionAppliedFor(e.target.value)}
                    placeholder="e.g., Software Engineer Intern"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="batch">Batch *</Label>
                  <Input
                    id="batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g., 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g., August - September 2023"
                  />
                </div>

                <div>
                  <Label htmlFor="ctc">CTC/Stipend</Label>
                  <Input
                    id="ctc"
                    value={ctcStipend}
                    onChange={(e) => setCtcStipend(e.target.value)}
                    placeholder="e.g., 12 LPA or 50k/month"
                  />
                </div>

                <div>
                  <Label htmlFor="offer">Final Offer Status</Label>
                  <Select value={finalOfferStatus} onValueChange={setFinalOfferStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select offer status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected by me">Rejected by me</SelectItem>
                      <SelectItem value="Rejected by company">Rejected by company</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="cursor-pointer">
                    Post anonymously
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Placement Rounds</span>
                  <Button type="button" onClick={addRound} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Round
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {rounds.map((round, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Round {index + 1}</h4>
                      {rounds.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeRound(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>Round Type *</Label>
                      <Select
                        value={round.round_type}
                        onValueChange={(value) => updateRound(index, "round_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assessment">Online Assessment</SelectItem>
                          <SelectItem value="coding">Coding Round</SelectItem>
                          <SelectItem value="technical_interview">Technical Interview</SelectItem>
                          <SelectItem value="hr_interview">HR Interview</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Round Name</Label>
                      <Input
                        value={round.round_name || ""}
                        onChange={(e) => updateRound(index, "round_name", e.target.value)}
                        placeholder="e.g., DSA Coding Test"
                      />
                    </div>

                    <div>
                      <Label>Difficulty (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={round.difficulty || ""}
                        onChange={(e) => updateRound(index, "difficulty", parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Topics Covered</Label>
                      <Textarea
                        value={round.topics_covered || ""}
                        onChange={(e) => updateRound(index, "topics_covered", e.target.value)}
                        placeholder="e.g., Arrays, Strings, Dynamic Programming"
                      />
                    </div>

                    <div>
                      <Label>Sections</Label>
                      <Textarea
                        value={round.sections || ""}
                        onChange={(e) => updateRound(index, "sections", e.target.value)}
                        placeholder="e.g., 3 coding questions, 20 MCQs"
                      />
                    </div>

                    <div>
                      <Label>Pass Status</Label>
                      <Select
                        value={round.pass_status || ""}
                        onValueChange={(value) => updateRound(index, "pass_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tips & Advice</Label>
                      <Textarea
                        value={round.tips || ""}
                        onChange={(e) => updateRound(index, "tips", e.target.value)}
                        placeholder="Share your preparation tips and advice"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Review
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
