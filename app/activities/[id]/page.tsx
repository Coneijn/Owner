import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCourseProgressForUser } from "@/lib/course-actions";
import CoursePlayer from "./CoursePlayer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentCoursePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // Obtenemos los datos base del curso
  const course = await prisma.course.findUnique({
    where: { id: courseId, isPublished: true }
  });

  if (!course) redirect("/activities");

  // Usamos nuestro motor de progreso calculado
  const progressRes = await getCourseProgressForUser(session.user.id, courseId);
  
  if (!progressRes.success || !progressRes.nodes) {
    return <div className="p-8 text-center text-red-500">Error loading course nodes.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <CoursePlayer 
        course={course} 
        nodes={progressRes.nodes} 
        userId={session.user.id} 
      />
    </div>
  );
}