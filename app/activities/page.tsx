import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Obtenemos solo los cursos que el Admin ya haya marcado como publicados
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand-accent">Training and Activities</h1>

      {courses.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded text-center mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-yellow-700">Coming Soon</h2>
          <p className="text-yellow-700 mt-2">There are no activities available yet. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className="bg-brand-accent shadow-lg rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-header transition-all hover:scale-[1.02]"
            >
              {/* Redirigimos a la vista inmersiva del estudiante */}
              <Link href={`/activities/${course.id}`} className="block relative w-full aspect-video group cursor-pointer bg-brand-dark">
                
                {/* Overlay oscuro y Botón de Play al centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-20">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4l12 6-12 6V4z" />
                    </svg>
                  </div>
                </div>

                {/* Fondo estilizado imitando la miniatura de un video */}
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/40 to-black/80 z-10 mix-blend-overlay"></div>
                <div className="absolute top-3 left-3 z-30">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Available
                  </span>
                </div>
              </Link>
              
              <div className="p-4 bg-yellow-500">
                <h3 className="text-sm text-gray-800 font-semibold mb-1">Course {index + 1}</h3>
                <h2 className="text-lg font-bold text-black leading-tight truncate">{course.title}</h2>
                <p className="text-sm text-gray-800 mt-2 line-clamp-2 font-medium">
                  {course.description || "Click to view the content of this module."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}