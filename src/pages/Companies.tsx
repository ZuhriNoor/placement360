import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Companies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (!error && data) {
        setCompanies(data);
      }
      setLoading(false);
    };

    fetchCompanies();
  }, [user, navigate]);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Explore Companies</h2>
            <p className="text-xl text-muted-foreground">
              Find reviews for companies you're interested in.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for a company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-secondary border-border"
            />
          </div>

          {/* Company Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 pt-8">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/company/${company.slug}`}
                    className="block h-full" // FIX 1: Make the link a block element
                  >
                    {/* FIX 2: Use the correct animation class and remove redundant/conflicting classes */}
                    <div className="bg-card rounded-lg p-6 hover:bg-card-hover text-center h-full animated-border animate-border-beam">
                      <h3 className="text-xl font-bold">{company.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredCompanies.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {companies.length === 0
                      ? "No companies available yet."
                      : "No companies found matching your search."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Companies;