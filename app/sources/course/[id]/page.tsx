import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Train, GripVertical, FileVideo, HelpCircle, Edit3 } from "lucide-react";
import AddWagonButton from "../../components/AddWagonButton";
import EditWagonButton from "../../components/EditWagonButton"; // 👈 Tu nuevo botón interactivo

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseEditorPage({ params }: Props) {
  // 1. Validar seguridad: Solo admins entran aquí
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/sources");
  }

  // 2. Obtener el ID de la URL
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // 3. Buscar el curso y todos sus vagones ordenados
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      nodes: {
        orderBy: { orderIndex: 'asc' },
        include: { 
          payload: {
            include: {
              questions: {
                include: { options: true } // Ahora traemos el banco de preguntas completo
              }
            }
          } 
        }
      }
    }
  });

  // Si alguien pone una URL falsa, lo regresamos
  if (!course) {
    redirect("/sources?tab=activities");
  }

  return (
    <div className="container mx-auto p-6 animate-in fade-in duration-300">
      {/* Cabecera del Curso */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <Link 
          href="/sources?tab=activities" 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-accent font-bold transition-colors mb-4 bg-brand-header hover:bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-accent tracking-tight">{course.title}</h1>
            <p className="text-gray-300 mt-2 text-base max-w-2xl">{course.description || "No description provided."}</p>
          </div>
          
          {/* Usamos nuestro nuevo componente cliente */}
          <AddWagonButton courseId={course.id} />
        </div>
      </div>

      {/* Zona de Vagones (Timeline) */}
      <div>
        <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
          <Train className="w-6 h-6 text-gray-400" />
          Course Sequence
        </h2>

        {course.nodes.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-2">The train is empty</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Click "Add Wagon" to create your first learning step (Video + Question).
            </p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:ml-8 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {course.nodes.map((node: any, index: number) => {
              const hasVideo = !!node.payload?.mediaUrl;
              const hasQuestion = node.payload?.questions && node.payload.questions.length > 0;

              return (
                <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                 <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-brand-dark bg-brand-accent text-brand-dark font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10">
                  {index + 1}
                </div>
                
                {/* Tarjeta del Vagón */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ml-auto md:ml-0 bg-brand-header border border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white">{node.title}</h3>
                      
                      {/* Aquí usamos nuestro nuevo componente cliente */}
                      <EditWagonButton wagon={node} courseId={course.id} />
                    </div>

                    {/* Estado del contenido (Video/Pregunta) */}
                    <div className="flex gap-4 mt-auto pt-4 border-t border-gray-100">
                      <div className={`flex items-center gap-1.5 text-sm font-semibold ${hasVideo ? 'text-green-600' : 'text-gray-400'}`}>
                        <FileVideo className="w-4 h-4" />
                        {hasVideo ? 'Video Configured' : 'No Video'}
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-semibold ${hasQuestion ? 'text-green-600' : 'text-gray-400'}`}>
                        <HelpCircle className="w-4 h-4" />
                        {hasQuestion ? 'Quiz Ready' : 'No Quiz'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}