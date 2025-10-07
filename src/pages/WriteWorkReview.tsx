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
import { Loader2 } from "lucide-react";

type Company = {
  id: string;
  name: string;
  slug: string;
};

export default function WriteWorkReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [companyId, setCompanyId] = useState("");
  const [positionAppliedFor, setPositionAppliedFor] = useState("");
  const [batch, setBatch] = useState("");
  const [timeline, setTimeline] = useState("");
  const [ctcStipend, setCtcStipend] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [workLifeBalance, setWorkLifeBalance] = useState<number>(5);
  const [learningOpportunities, setLearningOpportunities] = useState("");
  const [cultureRating, setCultureRating] = useState<number>(5);
  const [growthProspects, setGrowthProspects] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [overallExperience, setOverallExperience] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId || !jobTitle || !batch) {
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
          review_type: "work_experience",
          position_applied_for: positionAppliedFor,
          batch,
          timeline,
          ctc_stipend: ctcStipend,
          is_anonymous: isAnonymous,
          status: "pending"
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      const { error: detailsError } = await supabase
        .from("work_experience_details")
        .insert({
          review_id: review.id,
          job_title: jobTitle,
          department,
          work_life_balance: workLifeBalance,
          learning_opportunities: learningOpportunities,
          culture_rating: cultureRating,
          growth_prospects: growthProspects,
          pros,
          cons,
          overall_experience: overallExperience
        });

      if (detailsError) throw detailsError;

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
          <h1 className="text-3xl font-bold mb-2">Write Work Experience Review</h1>
          <p className="text-muted-foreground mb-8">Share your internship or work experience</p>

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
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer Intern"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Position Applied For</Label>
                  <Input
                    id="position"
                    value={positionAppliedFor}
                    onChange={(e) => setPositionAppliedFor(e.target.value)}
                    placeholder="e.g., Backend Developer Intern"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Engineering, Product"
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
                  <Label htmlFor="timeline">Duration</Label>
                  <Input
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g., May - July 2023 (3 months)"
                  />
                </div>

                <div>
                  <Label htmlFor="ctc">CTC/Stipend</Label>
                  <Input
                    id="ctc"
                    value={ctcStipend}
                    onChange={(e) => setCtcStipend(e.target.value)}
                    placeholder="e.g., 50k/month"
                  />
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
                <CardTitle>Experience Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workLife">Work-Life Balance: {workLifeBalance}/5</Label>
                  <Input
                    id="workLife"
                    type="range"
                    min="1"
                    max="5"
                    value={workLifeBalance}
                    onChange={(e) => setWorkLifeBalance(parseInt(e.target.value))}
                    className="mt-2 range-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="culture">Company Culture: {cultureRating}/5</Label>
                  <Input
                    id="culture"
                    type="range"
                    min="1"
                    max="5"
                    value={cultureRating}
                    onChange={(e) => setCultureRating(parseInt(e.target.value))}
                    className="mt-2 range-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="learning">Learning Opportunities</Label>
                  <Textarea
                    id="learning"
                    value={learningOpportunities}
                    onChange={(e) => setLearningOpportunities(e.target.value)}
                    placeholder="Describe the learning and skill development opportunities"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="growth">Growth Prospects</Label>
                  <Textarea
                    id="growth"
                    value={growthProspects}
                    onChange={(e) => setGrowthProspects(e.target.value)}
                    placeholder="Describe career growth and advancement opportunities"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="pros">Pros</Label>
                  <Textarea
                    id="pros"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="What did you like about working here?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cons">Cons</Label>
                  <Textarea
                    id="cons"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="What could be improved?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="overall">Overall Experience</Label>
                  <Textarea
                    id="overall"
                    value={overallExperience}
                    onChange={(e) => setOverallExperience(e.target.value)}
                    placeholder="Summarize your overall experience"
                    rows={4}
                  />
                </div>
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
