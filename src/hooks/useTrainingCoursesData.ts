import { useEffect, useState, useCallback, type SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string;
  is_mandatory: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  module_type: string;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

export interface ModuleProgress {
  module_id: string;
  completed: boolean;
  watched_seconds: number;
  score: number | null;
}

export function useTrainingCoursesData(agentId: string | undefined) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: moduleData } = await supabase
      .from("course_modules")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    let progressData: ModuleProgress[] = [];
    if (agentId) {
      const { data: p } = await supabase.from("course_progress").select("*").eq("agent_id", agentId);
      progressData = (p as ModuleProgress[]) || [];
    }

    setCourses((courseData as Course[]) || []);
    setModules((moduleData as CourseModule[]) || []);
    setProgress(progressData);
    setLoading(false);
  }, [agentId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getCourseProgress = (courseId: string) => {
    const courseModules = modules.filter((m) => m.course_id === courseId);
    if (courseModules.length === 0) return 0;
    const completed = courseModules.filter((m) =>
      progress.some((p) => p.module_id === m.id && p.completed)
    ).length;
    return Math.round((completed / courseModules.length) * 100);
  };

  const getCourseModules = (courseId: string) => modules.filter((m) => m.course_id === courseId);

  const isModuleCompleted = (moduleId: string) =>
    progress.some((p) => p.module_id === moduleId && p.completed);

  const updateProgress = (updater: SetStateAction<ModuleProgress[]>) => {
    setProgress(updater);
  };

  return {
    courses,
    modules,
    progress,
    loading,
    refetch: fetchCourses,
    getCourseProgress,
    getCourseModules,
    isModuleCompleted,
    setProgress: updateProgress,
  };
}
