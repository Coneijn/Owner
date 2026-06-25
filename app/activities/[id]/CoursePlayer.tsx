"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Lock, PlayCircle, Loader2, RefreshCcw } from "lucide-react";
import { evaluateQuiz, markWagonComplete } from "@/lib/course-actions";
import { useRouter } from "next/navigation";

export default function CoursePlayer({ course, nodes, userId }: { course: any, nodes: any[], userId: string }) {
  const router = useRouter();
  
  // Encontrar el primer nodo desbloqueado e incompleto para iniciar ahí
  const initialNode = nodes.find(n => n.isUnlocked && !n.isCompleted) || nodes[0];
  const [activeNodeId, setActiveNodeId] = useState<string>(initialNode?.id || "");
  
  // Máquina de estados UI
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizError, setQuizError] = useState("");

  const activeNode = nodes.find(n => n.id === activeNodeId);

  // Resetear estados al cambiar de vagón
  useEffect(() => {
    setIsVideoWatched(activeNode?.isCompleted || false); // Si ya lo pasó, tratar el video como visto
    setAnswers({});
    setQuizError("");
  }, [activeNodeId, activeNode?.isCompleted]);

  if (!activeNode) return <div className="p-8">No content available.</div>;

  const hasVideo = !!activeNode.payload?.mediaUrl;
  const questions = activeNode.payload?.questions || [];
  const hasQuestions = questions.length > 0;

  // Lógica principal: El video se terminó de reproducir
  const handleVideoEnded = async () => {
    setIsVideoWatched(true);
    
    // Regla de negocio: Vagón sin preguntas se completa automáticamente al acabar el video
    if (!hasQuestions && !activeNode.isCompleted) {
      setIsSubmitting(true);
      await markWagonComplete(userId, activeNode.id);
      router.refresh(); // Refresca los datos en servidor para actualizar el árbol de progreso
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setQuizError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setQuizError("");

    const payload = Object.entries(answers).map(([qId, oId]) => ({
      questionId: qId,
      optionId: oId as string
    }));

    const res = await evaluateQuiz(userId, activeNode.id, payload);
    
    if (res.success) {
      if (res.passed) {
        router.refresh(); // Desbloquea el siguiente nodo recargando datos del servidor
      } else {
        setQuizError(`You scored ${res.score}%. You need 75% to pass. Try again!`);
      }
    } else {
      setQuizError(res.error || "An error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-[calc(100vh-64px)]">
      {/* Sidebar: Timeline de Navegación */}
      <aside className="w-full lg:w-80 bg-brand-header border-r border-black/20 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-brand-header z-10">
          <h2 className="text-xl font-extrabold text-white leading-tight">{course.title}</h2>
          <p className="text-xs text-brand-accent mt-2 uppercase tracking-wider font-bold">Course Modules</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {nodes.map((node, index) => {
            const isSelectable = node.isUnlocked || node.isCompleted;
            const isActive = node.id === activeNodeId;
            
            return (
              <button
                key={node.id}
                disabled={!isSelectable}
                onClick={() => setActiveNodeId(node.id)}
                className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all ${
                  isActive ? "bg-brand-dark border border-brand-accent shadow-sm" : 
                  isSelectable ? "hover:bg-white/5 border border-transparent" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {node.isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                   isSelectable ? <PlayCircle className={`w-5 h-5 ${isActive ? "text-brand-accent" : "text-gray-400"}`} /> :
                   <Lock className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <span className={`text-xs font-bold ${node.isCompleted ? "text-green-400" : "text-gray-400"}`}>
                    Module {index + 1}
                  </span>
                  <p className={`text-sm font-semibold mt-0.5 ${isActive ? "text-white" : "text-gray-300"}`}>
                    {node.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50/50">
        <div className="max-w-4xl mx-auto w-full p-6 lg:p-10 space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{activeNode.title}</h1>
            {activeNode.isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Passed
              </span>
            )}
          </div>

          {/* Área de Video */}
          {hasVideo ? (
            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-lg aspect-video">
              <video 
                key={activeNode.payload.mediaUrl}
                src={activeNode.payload.mediaUrl} 
                controls 
                className="w-full h-full object-contain"
                onEnded={handleVideoEnded}
              />
            </div>
          ) : (
             <div className="w-full bg-gray-200 rounded-2xl flex items-center justify-center aspect-video shadow-inner">
               <p className="text-gray-500 font-medium">No video content for this module.</p>
             </div>
          )}

          {/* Área de Quiz */}
          {!activeNode.isCompleted ? (
            <>
              {hasQuestions ? (
                <div className={`transition-all duration-500 ${isVideoWatched ? 'opacity-100 translate-y-0' : 'opacity-50 blur-sm pointer-events-none translate-y-4'}`}>
                  <div className="bg-brand-header p-8 rounded-2xl shadow-lg border border-white/10">
                    <h3 className="text-2xl font-bold text-brand-accent mb-6 border-b border-white/10 pb-4">Knowledge Check</h3>
                    {!isVideoWatched && (
                      <p className="text-brand-accent font-bold mb-6 bg-brand-accent/10 border border-brand-accent/20 p-4 rounded-lg">
                          Please watch the video to the end to unlock this quiz.
                      </p>
                    )}
                    
                    <div className="space-y-8">
                      {questions.map((q: any, i: number) => (
                        <div key={q.id}>
                          <p className="text-base font-bold text-white mb-4">{i + 1}. {q.text}</p>
                          <div className="space-y-3">
                            {q.options.map((opt: any) => (
                              <label key={opt.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-brand-accent bg-brand-accent/10' : 'border-white/10 hover:border-white/30'}`}>
                                <input 
                                  type="radio" 
                                  name={`question-${q.id}`} 
                                  value={opt.id}
                                  checked={answers[q.id] === opt.id}
                                  onChange={() => setAnswers(prev => ({...prev, [q.id]: opt.id}))}
                                  className="w-5 h-5 text-brand-accent mr-4 focus:ring-brand-accent bg-brand-dark border-gray-600"
                                />
                                <span className="font-medium text-gray-200">{opt.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {quizError && (
                      <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 shrink-0" /> {quizError}
                      </div>
                    )}

                    <button 
                      onClick={handleQuizSubmit}
                      disabled={isSubmitting || !isVideoWatched}
                      className="mt-8 w-full py-4 bg-brand-accent hover:brightness-105 text-brand-dark font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Answers"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-brand-header border border-white/10 rounded-2xl shadow-lg">
                  {isVideoWatched ? (
                    isSubmitting ? <p className="text-brand-accent animate-pulse font-medium">Marking as complete...</p> : <p className="text-gray-400">Processing completion...</p>
                  ) : (
                    <p className="text-gray-400 font-semibold">Finish the video to complete this module.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            // Regla de negocio: Ocultar el quiz si ya pasó el vagón
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-green-400">Module Completed</h3>
                <p className="text-green-200/70 font-medium mt-1">You have successfully passed this section. Proceed to the next module in the sidebar.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}