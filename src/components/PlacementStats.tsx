import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Trophy, Building2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PlacedStudent = {
    id: string;
    company_id: string;
    student_name: string;
    batch: string;
    package: string | null;
    companies: {
        name: string;
        slug: string;
        logo_url: string | null;
    };
};

type CompanyStats = {
    name: string;
    slug: string;
    logo_url: string | null;
    count: number;
};

export const PlacementStats = () => {
    const [allStudents, setAllStudents] = useState<PlacedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [batches, setBatches] = useState<string[]>([]);

    const [stats, setStats] = useState<CompanyStats[]>([]);
    const [summary, setSummary] = useState({
        totalPlaced: 0,
        totalCompanies: 0,
        highestPackage: "N/A",
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await supabase
                .from("placed_students")
                .select(`
          id,
          batch,
          company_id,
          package,
          companies (
            name,
            slug,
            logo_url
          )
        `);

            if (error) {
                console.error("Error fetching placement stats:", error);
                setLoading(false);
                return;
            }

            if (data) {
                const students = data as unknown as PlacedStudent[];
                setAllStudents(students);

                // Extract unique batches
                const uniqueBatches = Array.from(new Set(students.map(s => s.batch))).sort().reverse();
                setBatches(uniqueBatches);

                // Set default batch to latest
                if (uniqueBatches.length > 0) {
                    setSelectedBatch(uniqueBatches[0]);
                }
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (!selectedBatch || allStudents.length === 0) return;

        // Filter students by selected batch
        const filteredStudents = allStudents.filter(s => s.batch === selectedBatch);

        // Calculate Stats
        const companyMap: Record<string, CompanyStats> = {};
        const uniqueStudents = new Set<string>();

        filteredStudents.forEach((student) => {
            const companyName = student.companies?.name || "Unknown";

            if (!companyMap[companyName]) {
                companyMap[companyName] = {
                    name: companyName,
                    slug: student.companies?.slug || "",
                    logo_url: student.companies?.logo_url || null,
                    count: 0
                };
            }

            companyMap[companyName].count++;
            uniqueStudents.add(student.student_name);
        });

        const sortedStats = Object.values(companyMap).sort((a, b) => b.count - a.count);
        setStats(sortedStats);

        setSummary({
            totalPlaced: uniqueStudents.size,
            totalCompanies: Object.keys(companyMap).length,
            highestPackage: "N/A"
        });

    }, [selectedBatch, allStudents]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (allStudents.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold">Placement Statistics</h2>
                    <p className="text-muted-foreground">
                        Snapshot of success for Batch {selectedBatch}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-card border px-4 py-2 rounded-lg">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium whitespace-nowrap">Select Batch:</span>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="w-[100px] h-8 border-none bg-transparent focus:ring-0">
                            <SelectValue placeholder="Batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <Card className="card-glow border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Students Placed in {selectedBatch}
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{summary.totalPlaced}</div>
                    </CardContent>
                </Card>
                <Card className="card-glow border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Companies Visited
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{summary.totalCompanies}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table for Desktop */}
            <div className="hidden md:block max-w-4xl mx-auto overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Company</th>
                                <th scope="col" className="px-6 py-4 text-right font-bold text-primary">Students Placed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.length > 0 ? (
                                stats.map((company, index) => (
                                    <tr
                                        key={company.slug}
                                        className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background/50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-bold border">
                                                {company.name.charAt(0)}
                                            </div>
                                            {company.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                                                {company.count}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                                        No placement data available for Batch {selectedBatch}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* List View for Mobile */}
            <div className="md:hidden space-y-4">
                {stats.length > 0 ? (
                    stats.map((company) => (
                        <div
                            key={company.slug}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card/50 backdrop-blur-sm card-glow"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border shrink-0">
                                    {company.name.charAt(0)}
                                </div>
                                <span className="font-semibold">{company.name}</span>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                                {company.count}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card/50">
                        No placement data available for Batch {selectedBatch}
                    </div>
                )}
            </div>
        </section>
    );
};
