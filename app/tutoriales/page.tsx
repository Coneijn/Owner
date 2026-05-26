"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Importamos Image de Next.js
import { tutorialVideos } from "../../lib/tutorialData";  

export default function TutorialesPage() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isClient, setIsClient] = useState(false);
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hasClickedPlay, setHasClickedPlay] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  useEffect(() => {
    setIsClient(true);
    const savedLevel = localStorage.getItem("tutorialProgress");
    
    if (savedLevel) {
      const level = parseInt(savedLevel, 10);
      setCurrentLevel(level);
      
      // Si recargan la página y su nivel sigue siendo el 1, se lo abrimos en automático
      if (level === 1) {
        setSelectedVideoId("1");
        setShowVideoModal(true);
      }
    } else {
      // Si no hay nada guardado (es su primera vez), abrimos el video 1 en automático
      setSelectedVideoId("1");
      setShowVideoModal(true);
    }
  }, []);

  const unlockNextLevel = () => {
    // Reiniciamconst unlockNextLevel = () => {
    // Reiniciamos los colores y la pregunta para el siguiente video
    setAnswerStatus('idle');
    setSelectedOptionIndex(null);
    setCurrentQuestionIndex(0);

    // Solo subimos de nivel si el video que acaban de responder es el actual (para no subir de nivel si repiten uno viejo)os los colores de las preguntas para el siguiente video
    setAnswerStatus('idle');
    setSelectedOptionIndex(null);

    // Solo subimos de nivel si el video que acaban de responder es el actual (para no subir de nivel si repiten uno viejo)
    if (selectedVideoId === currentLevel.toString()) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      localStorage.setItem("tutorialProgress", nextLevel.toString());
      
      // Avanzamos automáticamente al siguiente video en el "tren" si existe
      if (nextLevel <= tutorialVideos.length) {
        setSelectedVideoId(nextLevel.toString());
        setHasClickedPlay(false); // Reseteamos la portada para el nuevo video
        setShowQuestionModal(false);
        setShowVideoModal(true);
        return;
      }
    }
    
    // Si ya terminaron todos los videos o si estaban repasando uno viejo, los regresamos al mosaico
    setShowQuestionModal(false);
    setSelectedVideoId(null);
  };

  if (!isClient) return null;

  const activeVideo = tutorialVideos.find((v) => v.id === selectedVideoId);
  const isCourseCompleted = currentLevel > tutorialVideos.length;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Capacitación</h1>

      {isCourseCompleted && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded text-center mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-green-700">¡Felicidades!</h2>
          <p className="text-green-600">Has completado todos los módulos. Puedes repasar cualquier video a continuación.</p>
        </div>
      )}

      {/* VISTA DE MOSAICO (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorialVideos.map((video) => {
          const videoLevel = parseInt(video.id, 10);
          const isLocked = videoLevel > currentLevel;
          const isCurrent = videoLevel === currentLevel;
          const isCompleted = videoLevel < currentLevel;

          // No mostramos los videos que aún no han desbloqueado
          if (isLocked) return null; 

          return (
            <div 
              key={video.id} 
              className={`bg-yellow-500 shadow-lg rounded-xl overflow-hidden border-2 transition-all ${isCurrent ? 'border-blue-500 transform scale-105' : 'border-transparent hover:border-gray-300'}`}
            >
              {video.thumbnail && (
                <div 
                  className="relative w-full aspect-video group cursor-pointer bg-gray-100" 
                  onClick={() => {
                    setSelectedVideoId(video.id);
                    setShowVideoModal(true);
                  }}
                >
                  <Image 
                    src={video.thumbnail} 
                    alt={`Miniatura de ${video.title}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                      <svg className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4l12 6-12 6V4z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Etiqueta de estado del video */}
                  <div className="absolute top-3 left-3">
                    {isCompleted ? (
                      <span className="bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">✓ Completado</span>
                    ) : (
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">▶ Nivel Actual</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-sm text-gray-800 font-semibold mb-1">Módulo {video.id}</h3>
                <h2 className="text-lg font-bold leading-tight">{video.title}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DEL VIDEO */}
      {showVideoModal && activeVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          
          <div className="w-full max-w-4xl relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
            <button 
              onClick={() => {
                setShowVideoModal(false);
                setSelectedVideoId(null);
                setHasClickedPlay(false);
              }}
              className="absolute top-4 right-4 text-white bg-red-600 rounded-full w-10 h-10 flex items-center justify-center z-30 hover:bg-red-700 font-bold shadow-lg"
            >
              ✕
            </button>
            
            {!hasClickedPlay ? (
              /* PORTADA PERSONALIZADA CON BOTÓN DE PLAY GIGANTE */
              <div 
                className="absolute inset-0 z-20 flex flex-col items-center justify-center group cursor-pointer bg-black" 
                onClick={() => setHasClickedPlay(true)}
              >
                {activeVideo.thumbnail && (
                  <Image 
                    src={activeVideo.thumbnail} 
                    alt={`Miniatura de ${activeVideo.title}`} 
                    fill 
                    className="object-cover opacity-50 group-hover:opacity-40 transition-opacity" 
                  />
                )}
                <div className="relative z-30 bg-blue-600 text-white rounded-full p-6 shadow-2xl transform group-hover:scale-110 transition-all duration-300 ring-4 ring-blue-600/50">
                  <svg className="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4l12 6-12 6V4z" />
                  </svg>
                </div>
                <p className="relative z-30 text-white mt-6 font-bold text-xl tracking-wide shadow-black drop-shadow-md">
                  Haz clic para comenzar el video
                </p>
              </div>
            ) : (
              /* IFRAME DE GOOGLE DRIVE (Ya con permiso de autoplay del navegador) */
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-0">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400 font-semibold">Cargando reproductor...</p>
                </div>
                <iframe 
                  src={`${activeVideo.url}?autoplay=1`} 
                  className="w-full h-full border-0 relative z-10 bg-transparent"
                  allow="autoplay"
                  allowFullScreen
                ></iframe>
              </>
            )}
          </div>

          <button 
            onClick={() => {
              setShowVideoModal(false);
              setHasClickedPlay(false);
              // Si ya lo completaron antes, pueden solo cerrar el video sin contestar
              if (parseInt(activeVideo.id) < currentLevel) {
                setSelectedVideoId(null);
              } else {
                setShowQuestionModal(true);
              }
            }}
            className={`mt-6 px-8 py-3 rounded-full font-bold shadow-lg text-white transition-all ${parseInt(activeVideo.id) < currentLevel ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400 ring-offset-2 ring-offset-black'}`}
          >
            {parseInt(activeVideo.id) < currentLevel ? 'Cerrar Video (Ya completado)' : 'Ya vi el video, ir al Cuestionario →'}
          </button>
        </div>
      )}

      {/* MODAL DEL CUESTIONARIO */}
      {showQuestionModal && activeVideo && activeVideo.questions && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-8 shadow-2xl relative">
            
            {/* Botón para salir del "tren" desde el cuestionario */}
            <button 
              onClick={() => {
                setShowQuestionModal(false);
                setSelectedVideoId(null);
                setAnswerStatus('idle'); 
                setSelectedOptionIndex(null);
                setCurrentQuestionIndex(0); // Reseteamos el índice de la pregunta
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2 pr-6">
              Pregunta {currentQuestionIndex + 1} de {activeVideo.questions.length}
            </h3>
            
            <p className="mb-6 text-gray-900 text-lg">{activeVideo.questions[currentQuestionIndex].question}</p>
            
            <div className="space-y-3">
              {activeVideo.questions[currentQuestionIndex].options.map((option: string, index: number) => {
                
                const isSelected = selectedOptionIndex === index;
                let optionClasses = "w-full text-left px-6 py-4 border-2 rounded-lg transition-all duration-300 font-medium ";
                
                if (answerStatus === 'idle') {
                   optionClasses += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 cursor-pointer";
                } else if (isSelected && answerStatus === 'correct') {
                   optionClasses += "border-green-500 bg-green-50 text-green-800 cursor-default";
                } else if (isSelected && answerStatus === 'incorrect') {
                   optionClasses += "border-red-500 bg-red-50 text-red-800 cursor-default";
                } else {
                   optionClasses += "border-gray-100 opacity-50 text-gray-400 cursor-default";
                }

                return (
                  <button
                    key={index}
                    disabled={answerStatus !== 'idle'} 
                    onClick={() => {
                      setSelectedOptionIndex(index);
                      if (index === activeVideo.questions[currentQuestionIndex].correctAnswerIndex) {
                        setAnswerStatus('correct');
                      } else {
                        setAnswerStatus('incorrect');
                      }
                    }}
                    className={optionClasses}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* BOTONES INFERIORES SEGÚN RESULTADO */}
            {answerStatus === 'correct' && (
              <div className="mt-6 pt-4 border-t transition-opacity duration-500">
                <p className="text-green-600 font-bold text-center mb-3">¡Respuesta correcta! ✅</p>
                <button 
                  onClick={() => {
                    // Si aún hay preguntas, avanzamos a la siguiente. Si no, desbloqueamos el nivel.
                    if (currentQuestionIndex < activeVideo.questions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                      setAnswerStatus('idle');
                      setSelectedOptionIndex(null);
                    } else {
                      unlockNextLevel();
                    }
                  }}
                  className="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-4 rounded-lg transition shadow-md"
                >
                  Continuar
                </button>
              </div>
            )}

            {answerStatus === 'incorrect' && (
              <div className="mt-6 pt-4 border-t transition-opacity duration-500">
                <p className="text-red-600 font-bold text-center mb-3">Respuesta incorrecta ❌</p>
                <button 
                  onClick={() => {
                    setAnswerStatus('idle');
                    setSelectedOptionIndex(null);
                    setHasClickedPlay(false); 
                    setCurrentQuestionIndex(0); // Reinicia a la pregunta 1 al equivocarse
                    setShowQuestionModal(false);
                    setShowVideoModal(true);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition shadow-md"
                >
                  Ver video nuevamente para volver a intentarlo
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}