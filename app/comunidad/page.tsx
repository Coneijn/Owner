'use client';

import { useState, useEffect } from 'react';
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload';
import { createCommunityPost, getCommunityPosts, toggleLike, votePoll, addComment } from '@/app/actions/community-actions';

// Función para extraer el ID de YouTube
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ComunidadPage() {
  const [postText, setPostText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de Encuesta
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Estados para los comentarios colapsables
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [isCommenting, setIsCommenting] = useState(false);
  
  // Muro real conectado a base de datos
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (isBackgroundUpdate = false) => {
    // Solo mostramos la pantalla de carga si NO es una actualización de fondo
    if (!isBackgroundUpdate) setIsLoading(true);
    
    const data = await getCommunityPosts();
    setPosts(data);
    
    if (!isBackgroundUpdate) setIsLoading(false);
  };

  const handleLike = async (postId: string) => {
    // Actualización optimista inteligente: sumamos o restamos dependiendo si ya tenía like
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const isUnliking = post.hasLiked;
        return { 
          ...post, 
          hasLiked: !isUnliking, // Invertimos el estado visual localmente
          _count: { likes: Math.max(0, (post._count?.likes || 0) + (isUnliking ? -1 : 1)) } 
        };
      }
      return post;
    }));

    const result = await toggleLike(postId);
    // Recargamos silenciosamente los datos reales del servidor
    loadPosts(true); 
  };

  const handleVideoValidation = (url: string) => {
    setVideoUrl(url);
    if (!url) {
      setVideoError('');
      return;
    }
    // Validar Drive, YouTube o Dailymotion
    const isValid = /youtube\.com|youtu\.be|drive\.google\.com|dailymotion\.com/.test(url.toLowerCase());
    if (!isValid) {
      setVideoError('Solo se permiten enlaces de YouTube, Google Drive o Dailymotion.');
    } else {
      setVideoError('');
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handlePostSubmit = async () => {
    const validPollOptions = pollOptions.filter(opt => opt.trim() !== '');
    // Validar que si abrió encuesta, tenga al menos 2 opciones
    if (showPollCreator && validPollOptions.length < 2) {
      alert("Una encuesta necesita al menos 2 opciones.");
      return;
    }
    if (!postText && !videoUrl && imageFiles.length === 0 && validPollOptions.length === 0) return; 

    setIsPublishing(true);
    const result = await createCommunityPost({
      text: postText,
      videoUrl: videoError ? '' : videoUrl,
      imageUrl: imageFiles.length > 0 ? imageFiles[0].url : '',
      pollOptions: showPollCreator ? validPollOptions : [],
    });

    if (result.success) {
      setPostText('');
      setVideoUrl('');
      setImageFiles([]); 
      setShowPollCreator(false);
      setPollOptions(['', '']);
      loadPosts(true); // true = recarga silenciosa
    } else {
      alert("Hubo un error al publicar. Inténtalo de nuevo.");
    }
    setIsPublishing(false);
  };

  const handleVote = async (postId: string, optionId: string) => {
    const result = await votePoll(postId, optionId);
    if (result.success) {
      loadPosts(true); // true = recarga los porcentajes sin brincar la pantalla
    } else {
      alert(result.error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentTexts(prev => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text || text.trim() === '') return;
    
    setIsCommenting(true);
    const result = await addComment(postId, text);
    
    if (result.success) {
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      loadPosts(true); // Recarga silenciosa para ver el comentario nuevo
    } else {
      alert(result.error || "Error al enviar el comentario");
    }
    setIsCommenting(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white">
          Muro de la <span className="text-[#f8ed1a]">Comunidad</span>
        </h1>

        {/* Caja de Creación de Publicación */}
        <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-xl shadow-2xl border border-gray-800 mb-8">
          <textarea
            className="w-full p-4 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f8ed1a] resize-none transition-all"
            rows={3}
            placeholder="¿Qué quieres compartir con la comunidad?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          
          <div className="mt-4 space-y-3">
            <input
              type="text"
              className="w-full p-3 text-sm bg-black/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8ed1a] transition-all"
              placeholder="Pegar enlace de video (YouTube, Drive, Dailymotion)..."
              value={videoUrl}
              onChange={(e) => handleVideoValidation(e.target.value)}
            />
            {videoError && <p className="text-red-500 text-xs font-bold">{videoError}</p>}
          </div>

          <div className="mt-4 p-4 border border-gray-800 rounded-lg bg-black/20">
            <ImageUpload 
              label="Adjuntar Imagen (Opcional)" 
              value={imageFiles} 
              onChange={setImageFiles} 
              multiple={false} 
              disableMetadata={true} 
            />
          </div>

          {/* Creador de Encuestas */}
          {showPollCreator && (
            <div className="mt-4 p-4 border border-gray-800 rounded-lg bg-[#111111] space-y-3 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#f8ed1a] font-bold text-sm uppercase tracking-widest">Opciones de Encuesta</span>
                <button onClick={() => { setShowPollCreator(false); setPollOptions(['', '']); }} className="text-gray-500 hover:text-red-400 text-xs font-bold uppercase transition">Cancelar</button>
              </div>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="w-full p-3 text-sm bg-black/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f8ed1a]"
                  placeholder={`Opción ${idx + 1}...`}
                  value={opt}
                  onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                />
              ))}
              {pollOptions.length < 4 && (
                <button onClick={handleAddPollOption} className="text-[#f8ed1a] text-xs font-bold uppercase hover:underline mt-2 inline-block">+ Añadir otra opción (Máx 4)</button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between mt-6 gap-4 border-t border-gray-800 pt-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors font-medium border ${showPollCreator ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'}`}
              >
                <span>📊</span> Crear Encuesta
              </button>
            </div>
            
            <button 
              onClick={handlePostSubmit}
              disabled={!!videoError || (!postText && !videoUrl && imageFiles.length === 0 && !showPollCreator) || isPublishing}
              className="bg-[#f8ed1a] text-black hover:bg-yellow-400 px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(248,237,26,0.2)]"
            >
              {isPublishing ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>

      {/* Feed de Publicaciones (Muro) */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-16 bg-[#1a1a1a] border border-dashed border-gray-800 rounded-xl">
            <p className="text-[#f8ed1a] font-bold animate-pulse">Cargando publicaciones...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1a] border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500 font-medium">Aún no hay publicaciones. ¡Sé el primero en compartir algo!</p>
          </div>
        ) : (
          posts.map((post) => {
            const ytId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;
            const postDate = new Date(post.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

            return (
              <div key={post.id} className="bg-[#1a1a1a] p-5 md:p-6 rounded-xl shadow-lg border border-gray-800 transition-all hover:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full border-2 border-[#f8ed1a] flex items-center justify-center font-black text-[#f8ed1a] text-xl">
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-md">{post.author?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 font-medium">{postDate}</p>
                  </div>
                </div>
                
                {post.text && (
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                )}
                
                {post.imageUrl && (
                  <div className="mb-5 rounded-lg overflow-hidden border border-gray-800 bg-black/50 flex justify-center">
                    <img src={post.imageUrl} alt="Post adjunto" className="w-full h-auto object-contain max-h-[500px]" />
                  </div>
                )}

                {post.videoUrl && (
                  <div className="mb-5 rounded-lg overflow-hidden border border-gray-800 bg-black/50">
                    {ytId ? (
                      <div className="relative w-full aspect-video">
                        <iframe 
                          src={`https://www.youtube.com/embed/${ytId}`} 
                          title="YouTube video player" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full border-0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="p-4 text-sm break-all">
                        <span className="font-bold text-gray-400 block mb-2">🔗 Enlace de video:</span> 
                        <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300 transition-colors font-medium">
                          {post.videoUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Render de Encuesta */}
                {post.options && post.options.length > 0 && (
                  <div className="mb-5 bg-black/30 border border-gray-800 rounded-xl p-4 md:p-5">
                    <span className="text-[#f8ed1a] font-bold text-xs uppercase tracking-widest mb-4 block flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                      Encuesta de la Comunidad
                    </span>
                    <div className="space-y-3">
                      {post.options.map((option: any) => {
                        const totalVotes = post.pollVotes?.length || 0; 
                        const optionVotes = option._count?.votes || 0;
                        const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                        
                        // Validamos si el usuario actual fue quien votó por esta opción
                        const hasVotedForThis = option.votes && option.votes.length > 0;

                        return (
                          <button 
                            key={option.id}
                            onClick={() => handleVote(post.id, option.id)}
                            className={`w-full relative overflow-hidden bg-gray-900 border ${hasVotedForThis ? 'border-[#f8ed1a]' : 'border-gray-700 hover:border-gray-500'} rounded-lg p-4 text-left transition-all group`}
                          >
                            <div 
                              className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${hasVotedForThis ? 'bg-[#f8ed1a]/30' : 'bg-[#f8ed1a]/10'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                            <div className="relative z-10 flex justify-between items-center gap-4">
                              <span className={`font-medium text-sm transition-colors line-clamp-2 ${hasVotedForThis ? 'text-[#f8ed1a]' : 'text-white group-hover:text-[#f8ed1a]'}`}>
                                {option.text}
                              </span>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[#f8ed1a] text-sm font-black">{percentage}%</span>
                                <span className="text-gray-500 text-[10px] uppercase font-bold">{optionVotes} votos</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-right text-gray-500 font-medium text-xs mt-3">{post.pollVotes?.length || 0} votos en total</p>
                  </div>
                )}

                <div className="border-t border-gray-800 pt-4 flex gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`${post.hasLiked ? 'text-[#f8ed1a]' : 'text-gray-400'} hover:text-[#f8ed1a] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wide`}
                  >
                    {/* El SVG ahora se rellena de amarillo si hasLiked es true */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={post.hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Me gusta ({post._count?.likes || 0})
                  </button>

                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`${showComments[post.id] ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wide`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Comentar ({post._count?.comments || 0})
                  </button>
                </div>

                {/* SECCIÓN COLAPSABLE DE COMENTARIOS */}
                {showComments[post.id] && (
                  <div className="mt-4 border-t border-gray-800 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Lista de comentarios */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment: any) => (
                          <div key={comment.id} className="bg-black/30 p-3 rounded-lg border border-gray-800">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-[#f8ed1a]">{comment.user?.name || 'Usuario'}</p>
                              <span className="text-[10px] text-gray-500 font-medium">
                                {new Date(comment.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic text-center py-2">No hay comentarios aún. ¡Anímate a responder!</p>
                      )}
                    </div>
                    
                    {/* Input para nuevo comentario */}
                    <div className="flex gap-2 items-center mt-2">
                      <input 
                        type="text" 
                        value={commentTexts[post.id] || ''} 
                        onChange={(e) => handleCommentChange(post.id, e.target.value)} 
                        placeholder="Escribe un comentario..." 
                        className="flex-1 bg-black/50 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f8ed1a]" 
                        onKeyDown={(e) => { if(e.key === 'Enter') handleCommentSubmit(post.id); }}
                      />
                      <button 
                        disabled={!commentTexts[post.id]?.trim() || isCommenting} 
                        onClick={() => handleCommentSubmit(post.id)} 
                        className="bg-gray-800 hover:bg-gray-700 text-[#f8ed1a] px-4 py-3 rounded-lg font-bold text-xs uppercase disabled:opacity-50 transition-colors border border-gray-700"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}