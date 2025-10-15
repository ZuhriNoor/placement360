import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, User, Plus, Trash2, Building2 } from "lucide-react";

// --- Types Definition ---

type Review = {
  id: string;
  review_type: "placement" | "work_experience";
  position_applied_for: string;
  batch: string;
  status: string;
  created_at: string;
  is_anonymous: boolean;
  companies: { name: string } | null;
  profiles: { full_name: string; email: string } | null;
  // Fields for placement reviews that might be useful in the dialog
  timeline?: string;
  ctc_stipend?: string;
  final_offer_status?: string;
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

type Company = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  created_at: string;
};

// --- Helper Function ---

const getRoundTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    assessment: "Online Assessment",
    coding: "Coding Round",
    technical_interview: "Technical Interview",
    hr_interview: "HR Interview",
    other: "Other",
  };
  return labels[type] || type;
};


export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState<"reviews" | "companies">("reviews");
  
  // State for "Add Company" Dialog
  const [newCompany, setNewCompany] = useState({ name: "", slug: "", website: "", description: "" });
  const [isCompanyDialogOpen, setCompanyDialogOpen] = useState(false);

  // State for "View Review" Dialog
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (data) {
      setIsAdmin(true);
    } else {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`*, companies(name), profiles(full_name, email)`)
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error loading reviews");
    } else if (data) {
      setReviews(data as any);
    }
    setLoading(false);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("companies").select("*").order("name");
    if (error) toast.error("Error loading companies");
    else if (data) setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "reviews") fetchReviews();
      else fetchCompanies();
    }
  }, [filter, isAdmin, activeTab]);

  const updateReviewStatus = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
      if (error) throw error;
      toast.success(`Review ${status} successfully`);
      setReviewDialogOpen(false); // Close dialog on success
      fetchReviews(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Error updating review");
    }
  };
  
  const handleReviewClick = async (review: Review) => {
    setSelectedReview(review);
    setReviewDialogOpen(true);
    setRounds([]); // Clear previous rounds
    
    // Only fetch rounds for placement reviews
    if (review.review_type === "placement") {
      setLoadingRounds(true);
      const { data } = await supabase
        .from("placement_rounds")
        .select("*")
        .eq("review_id", review.id)
        .order("round_order");
      
      if (data) setRounds(data);
      setLoadingRounds(false);
    }
  };

  const addCompany = async () => {
    if (!newCompany.name || !newCompany.slug) {
      toast.error("Company name and slug are required");
      return;
    }
    try {
      const { error } = await supabase.from("companies").insert([newCompany]);
      if (error) throw error;
      toast.success("Company added successfully");
      setNewCompany({ name: "", slug: "", website: "", description: "" });
      setCompanyDialogOpen(false);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || "Error adding company");
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", companyId);
      if (error) throw error;
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || "Error deleting company");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage reviews and companies</p>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-6">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value={filter} className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : reviews.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No {filter} reviews found</CardContent></Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} onClick={() => handleReviewClick(review)} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {review.companies?.name || "Unknown Company"} - {review.position_applied_for}
                                <Badge variant={review.review_type === "placement" ? "default" : "secondary"}>
                                  {review.review_type === "placement" ? "Placement" : "Work Experience"}
                                </Badge>
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                {review.is_anonymous ? <span>Anonymous</span> : review.profiles ? <>{review.profiles.full_name} ({review.profiles.email})</> : <span>Unknown User</span>}
                                <span>•</span>
                                <span>Batch {review.batch}</span>
                                <span>•</span>
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Companies Tab Content remains the same */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Companies</h2>
              <Dialog open={isCompanyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Company</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Company</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="name">Company Name *</Label><Input id="name" value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="e.g., Google" /></div>
                    <div className="space-y-2"><Label htmlFor="slug">Slug *</Label><Input id="slug" value={newCompany.slug} onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })} placeholder="e.g., google" /></div>
                    <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={newCompany.website} onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })} placeholder="https://..." /></div>
                    <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" value={newCompany.description} onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })} placeholder="Brief description" /></div>
                    <Button onClick={addCompany} className="w-full">Add Company</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
            : companies.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No companies found</CardContent></Card>
            : <div className="grid gap-4">{companies.map((company) => (
                <Card key={company.id}><CardContent className="py-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><Building2 className="w-8 h-8 text-muted-foreground" /><div><h3 className="font-semibold">{company.name}</h3><p className="text-sm text-muted-foreground">Slug: {company.slug}</p>{company.website && (<a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{company.website}</a>)}</div></div><Button variant="destructive" size="sm" onClick={() => deleteCompany(company.id)}><Trash2 className="w-4 h-4" /></Button></div></CardContent></Card>
              ))}</div>
            }
          </TabsContent>
        </Tabs>
      </main>

      {/* --- Review Details Dialog --- */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Details: {selectedReview?.companies?.name}</DialogTitle>
            <DialogDescription>
              {selectedReview?.position_applied_for} • Batch {selectedReview?.batch}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {loadingRounds ? (
               <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
               
            ) : selectedReview?.review_type === 'placement' ? (
                rounds.length > 0 ? (
                  rounds.map((round, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Round {round.round_order}: {getRoundTypeLabel(round.round_type)}</span>
                          {round.pass_status && <Badge variant={round.pass_status === "passed" ? "default" : "secondary"}>{round.pass_status}</Badge>}
                        </CardTitle>
                        {round.round_name && <p className="text-sm text-muted-foreground">{round.round_name}</p>}
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {round.difficulty && <div><span className="font-semibold">Difficulty:</span> {round.difficulty}/5</div>}
                        {round.topics_covered && <div><span className="font-semibold">Topics:</span><p className="text-muted-foreground mt-1">{round.topics_covered}</p></div>}
                        {round.sections && <div><span className="font-semibold">Sections:</span><p className="text-muted-foreground mt-1">{round.sections}</p></div>}
                        {round.tips && <div><span className="font-semibold">Tips:</span><p className="text-muted-foreground mt-1">{round.tips}</p></div>}
                      </CardContent>
                    </Card>
                  ))
                ) : <p className="text-muted-foreground text-center py-8">{selectedReview?.created_at} No round details found for this placement review.</p>
            ) : (
                <p className="text-muted-foreground text-center py-8">Work experience reviews do not have detailed rounds.</p>
            )}
          </div>
          
          {filter === "pending" && selectedReview && (
            <DialogFooter>
              <Button onClick={() => updateReviewStatus(selectedReview.id, "rejected")} variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />Reject
              </Button>
              <Button onClick={() => updateReviewStatus(selectedReview.id, "approved")}>
                <CheckCircle className="w-4 h-4 mr-2" />Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}