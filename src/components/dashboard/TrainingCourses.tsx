import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, PlayCircle, FileQuestion, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string;
  is_mandatory: boolean;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  module_type: string;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  watched_seconds: number;
  score: number | null;
}

interface TrainingCoursesProps {
  agentId: string | undefined;
}

const TrainingCourses = ({ agentId }: TrainingCoursesProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [agentId]);

  const fetchCourses = async () => {
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setCourses((courseData as Course[]) || []);

    const { data: moduleData } = await supabase
      .from("course_modules")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setModules((moduleData as CourseModule[]) || []);

    if (agentId) {
      const { data: progressData } = await supabase
        .from("course_progress")
        .select("*")
        .eq("agent_id", agentId);
      setProgress((progressData as ModuleProgress[]) || []);
    }
  };

  const getCourseProgress = (courseId: string) => {
    const courseModules = modules.filter((m) => m.course_id === courseId);
    if (courseModules.length === 0) return 0;
    const completed = courseModules.filter((m) => progress.some((p) => p.module_id === m.id && p.completed)).length;
    return Math.round((completed / courseModules.length) * 100);
  };

  const getCourseModules = (courseId: string) => modules.filter((m) => m.course_id === courseId);

  const isModuleCompleted = (moduleId: string) => progress.some((p) => p.module_id === moduleId && p.completed);

  const markComplete = async (moduleId: string) => {
    if (!agentId) return;
    const existing = progress.find((p) => p.module_id === moduleId);
    if (existing) {
      await supabase
        .from("course_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("agent_id", agentId)
        .eq("module_id", moduleId);
    } else {
      await supabase
        .from("course_progress")
        .insert({ agent_id: agentId, module_id: moduleId, completed: true, completed_at: new Date().toISOString() });
    }
    setProgress((prev) => {
      const idx = prev.findIndex((p) => p.module_id === moduleId);
      if (idx >= 0) return prev.map((p, i) => (i === idx ? { ...p, completed: true } : p));
      return [...prev, { module_id: moduleId, completed: true, watched_seconds: 0, score: null }];
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="h-6 w-6 text-accent" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Training Courses</h2>
          <p className="text-sm text-muted-foreground">Complete all mandatory courses to stay compliant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((course) => {
          const pct = getCourseProgress(course.id);
          const modCount = getCourseModules(course.id).length;
          const completedCount = getCourseModules(course.id).filter((m) => isModuleCompleted(m.id)).length;

          return (
            <Card
              key={course.id}
              className="border-border hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="h-32 bg-gradient-to-br from-primary/80 to-primary rounded-t-lg flex items-center justify-center relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="h-12 w-12 text-primary-foreground/60" />
                )}
                {course.is_mandatory && (
                  <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Required
                  </Badge>
                )}
                {pct === 100 && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{course.category}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{course.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{completedCount}/{modCount} modules</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No courses available yet</p>
          </div>
        )}
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selectedCourse.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {getCourseModules(selectedCourse.id).map((mod, idx) => {
                  const done = isModuleCompleted(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        done ? "bg-green-50 border-green-200" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {mod.module_type === "video" ? (
                            <PlayCircle className="h-4 w-4 text-accent" />
                          ) : (
                            <FileQuestion className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="font-medium text-sm">{mod.title}</span>
                        </div>
                        {mod.duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> {mod.duration_minutes} min
                          </span>
                        )}
                      </div>
                      {!done && (
                        <Button size="sm" variant="outline" onClick={() => markComplete(mod.id)}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingCourses;
