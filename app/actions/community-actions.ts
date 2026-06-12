'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// 1. Obtener todas las publicaciones
export async function getCommunityPosts() {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true }
        },
        _count: {
          select: { likes: true, comments: true } // <-- Contamos los comentarios
        },
        likes: currentUserId ? {
          where: { userId: currentUserId },
          select: { id: true }
        } : false,
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: currentUserId ? {
              where: { userId: currentUserId },
              select: { id: true }
            } : false
          }
        },
        pollVotes: {
          select: { userId: true }
        },
        // Traemos todos los comentarios ordenados del más viejo al más nuevo
        comments: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return posts.map(post => ({
      ...post,
      hasLiked: currentUserId ? (post.likes && post.likes.length > 0) : false,
    }));
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return [];
  }
}

// 2. Crear una nueva publicación
export async function createCommunityPost(formData: {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  pollOptions?: string[];
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado");
  }

  try {
    const newPost = await prisma.communityPost.create({
      data: {
        text: formData.text,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        authorId: session.user.id,
        options: formData.pollOptions && formData.pollOptions.length > 0 ? {
          create: formData.pollOptions.map(opt => ({ text: opt }))
        } : undefined
      }
    });

    revalidatePath('/comunidad');
    return { success: true, post: newPost };
  } catch (error) {
    console.error("Error al crear post:", error);
    return { success: false, error: "Error al publicar" };
  }
}

// 3. Dar o quitar "Me gusta"
export async function toggleLike(postId: string) {
  const session = await auth();
  
  if (!session?.user?.id) throw new Error("No estás autenticado");

  try {
    const existingLike = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } }
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.postLike.create({ data: { postId, userId: session.user.id } });
    }

    revalidatePath('/comunidad');
    return { success: true };
  } catch (error) {
    console.error("Error al procesar like:", error);
    return { success: false, error: "Error al procesar el like" };
  }
}

// 4. Votar en encuesta
export async function votePoll(postId: string, optionId: string) {
  const session = await auth();
  
  if (!session?.user?.id) return { success: false, error: "Inicia sesión para votar." };

  try {
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id
        }
      }
    });

    if (existingVote) {
      if (existingVote.optionId === optionId) {
        await prisma.pollVote.delete({
          where: { id: existingVote.id }
        });
      } else {
        await prisma.pollVote.update({
          where: { id: existingVote.id },
          data: { optionId: optionId }
        });
      }
    } else {
      await prisma.pollVote.create({
        data: {
          postId: postId,
          optionId: optionId,
          userId: session.user.id
        }
      });
    }

    revalidatePath('/comunidad');
    return { success: true };
  } catch (error) {
    console.error("Error al votar:", error);
    return { success: false, error: "Error al procesar el voto." };
  }
}

// 5. NUEVO: Agregar un comentario
export async function addComment(postId: string, text: string) {
  const session = await auth();
  
  if (!session?.user?.id) return { success: false, error: "Inicia sesión para comentar." };

  try {
    await prisma.communityComment.create({
      data: {
        text,
        postId,
        userId: session.user.id
      }
    });

    revalidatePath('/comunidad');
    return { success: true };
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    return { success: false, error: "No se pudo enviar el comentario." };
  }
}