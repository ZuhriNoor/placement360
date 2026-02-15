
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Linkedin, User, Briefcase, GraduationCap, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PlacedStudent = {
    id: string;
    student_name: string;
    batch: string;
    linkedin_url: string | null;
    role: string | null;
    package: string | null;
    img_url: string | null;
};

interface PlacedStudentsListProps {
    companyId: string;
}

export const PlacedStudentsList = ({ companyId }: PlacedStudentsListProps) => {
    const [students, setStudents] = useState<PlacedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<PlacedStudent | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!companyId) return;

            const { data, error } = await supabase
                .from("placed_students")
                .select("*")
                .eq("company_id", companyId)
                .order("batch", { ascending: false });

            if (error) {
                console.error("Error fetching placed students:", error);
            } else if (data) {
                setStudents(data as any);
            }
            setLoading(false);
        };

        fetchStudents();
    }, [companyId]);

    const handleStudentClick = (student: PlacedStudent) => {
        setSelectedStudent(student);
        setIsDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (students.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 mt-12">
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Placed Students</h3>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">
                    {students.length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                    <Card
                        key={student.id}
                        className="card-glow border-primary/10 hover:border-primary/30 transition-all cursor-pointer hover:bg-muted/50"
                        onClick={() => handleStudentClick(student)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
                                    {student.img_url ? (
                                        <img src={student.img_url} alt={student.student_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg truncate">{student.student_name}</h4>
                                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-3 h-3" />
                                            <span>Batch {student.batch}</span>
                                        </div>
                                        {student.role && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" />
                                                <span className="truncate">{student.role}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>
                            Information about the placed student.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="flex flex-col items-center space-y-6 py-4">
                            <Avatar className="w-24 h-24 border-2 border-primary/20">
                                <AvatarImage src={selectedStudent.img_url || ""} alt={selectedStudent.student_name} />
                                <AvatarFallback className="text-2xl bg-secondary">
                                    {selectedStudent.student_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-bold">{selectedStudent.student_name}</h2>
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Batch {selectedStudent.batch}</span>
                                </div>
                            </div>

                            <div className="w-full grid gap-3">
                                {selectedStudent.role && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">Role</p>
                                            <p className="font-semibold">{selectedStudent.role}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedStudent.package && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border">
                                        <Banknote className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">Package</p>
                                            <p className="font-semibold">{selectedStudent.package}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedStudent.linkedin_url && (
                                    <a
                                        href={selectedStudent.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button className="w-full gap-2 neon-border" variant="outline">
                                            <Linkedin className="w-4 h-4 text-[#0077b5]" />
                                            View LinkedIn Profile
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

