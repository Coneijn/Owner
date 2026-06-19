'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';

// Acción para crear un nuevo "Tren" (Curso)
export async function createCourse(title: string, description: string) {
  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        isPublished: false, // Nace oculto para que lo puedan armar tranquilos
      },
    });
    
    // Refrescamos la vista de actividades
    revalidatePath('/sources');
    
    return { success: true, course };
  } catch (error) {
    console.error("Error al crear el curso:", error);
    return { success: false, error: "No se pudo crear el curso en la base de datos." };
  }
}

// Acción para agregar un "Vagón" vacío a un tren
export async function createWagon(courseId: string, title: string) {
  try {
    // 1. Buscamos el índice más alto actual en este curso
    const lastNode = await prisma.activityNode.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' }
    });

    // 2. Si hay vagones, sumamos 10 al índice mayor. Si no, empezamos en 10.
    const newOrderIndex = lastNode ? lastNode.orderIndex + 10 : 10;

    // 3. Creamos el nodo (Vagón) y su payload vacío asociado
    const wagon = await prisma.activityNode.create({
      data: {
        courseId,
        title,
        orderIndex: newOrderIndex,
        payload: {
          create: {} // Nace sin video y sin pregunta, listo para ser llenado después
        }
      }
    });

    // 4. Refrescamos la página específica de este curso
    revalidatePath(`/sources/course/${courseId}`);

    return { success: true, wagon };
  } catch (error) {
    console.error("Error al crear el vagón:", error);
    return { success: false, error: "No se pudo agregar el vagón al curso." };
  }
}

// --- NUEVAS ACCIONES PARA EDITAR EL VAGÓN ---

// 1. Obtener los videos que ya se subieron al Gestor Multimedia (Pestaña Files)
export async function getAvailableVideos() {
  try {
    const videos = await prisma.mediaFile.findMany({
      where: { type: { startsWith: "video/" } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true }
    });
    return { success: true, videos };
  } catch (error) {
    return { success: false, error: "Error al cargar videos de la base de datos." };
  }
}

// 2. Guardar el contenido del vagón (Multimedia + Banco de Preguntas)
export async function updateWagonContent(
  nodeId: string, 
  courseId: string,
  mediaUrl: string | null, 
  mediaType: string | null, 
  questions: { text: string; options: { text: string; isCorrect: boolean }[] }[]
) {
  try {
    const payload = await prisma.nodePayload.findUnique({
      where: { nodeId }
    });

    if (!payload) throw new Error("No se encontró el contenedor del vagón.");

    await prisma.nodePayload.update({
      where: { id: payload.id },
      data: {
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        questions: {
          deleteMany: {},
          create: questions.map(q => ({
            text: q.text,
            options: {
              create: q.options.map(opt => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/sources/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error actualizing content:", error);
    return { success: false, error: "No se pudo guardar el contenido." };
  }
}
// 3. Alternar el estado de un Curso (Draft <-> Published)
export async function togglePublishCourse(courseId: string) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, error: "Curso no encontrado." };

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: !course.isPublished }
    });

    revalidatePath('/sources');
    revalidatePath('/activities');
    return { success: true, isPublished: updated.isPublished };
  } catch (error) {
    console.error("Error al alternar publicación:", error);
    return { success: false, error: "No se pudo cambiar el estado del curso." };
  }
}

// 4. Eliminar un Vagón (ActivityNode) de la ruta
export async function deleteWagon(nodeId: string) {
  try {
    await prisma.activityNode.delete({
      where: { id: nodeId }
    });
    revalidatePath('/sources');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el vagón:", error);
    return { success: false, error: "No se pudo eliminar el vagón." };
  }
}

// 5. Motor de Evaluación: Batch Submission y compuerta de validación del 75%
export async function evaluateQuiz(userId: string, nodeId: string, answers: { questionId: string; optionId: string }[]) {
  try {
    const payload = await prisma.nodePayload.findUnique({
      where: { nodeId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!payload || !payload.questions.length) {
      return { success: false, error: "Este módulo no contiene evaluaciones configuradas." };
    }

    const totalQuestions = payload.questions.length;
    let correctCount = 0;

    payload.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const correctOption = question.options.find(o => o.isCorrect);
      if (userAnswer && correctOption && userAnswer.optionId === correctOption.id) {
        correctCount++;
      }
    });

    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= 75; // Regla restrictiva del 75%

    if (passed) {
      // Abre la compuerta registrando el progreso aprobado
      await prisma.userProgress.upsert({
        where: {
          userId_nodeId: { userId, nodeId }
        },
        update: { score, completedAt: new Date() },
        create: { userId, nodeId, score }
      });
    }

    return {
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions
    };
  } catch (error) {
    console.error("Error al procesar la evaluación grupal:", error);
    return { success: false, error: "Ocurrió un error interno al evaluar las respuestas." };
  }
}

// 5.5 Auto-completar vagones que solo tienen multimedia (Sin Quiz)
export async function markWagonComplete(userId: string, nodeId: string) {
  try {
    await prisma.userProgress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: { score: 100, completedAt: new Date() },
      create: { userId, nodeId, score: 100 }
    });
    revalidatePath(`/activities`);
    return { success: true };
  } catch (error) {
    console.error("Error al marcar vagón como completado:", error);
    return { success: false, error: "No se pudo actualizar el progreso." };
  }
}

// 6. Cálculo dinámico de desbloqueo secuencial para la interfaz del estudiante
export async function getCourseProgressForUser(userId: string, courseId: string) {
  try {
    const nodes = await prisma.activityNode.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: { 
        payload: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        } 
      }
    });

    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        node: { courseId }
      }
    });

    const completedNodeIds = new Set(userProgress.map(p => p.nodeId));

    let canAccessNext = true;
    const processedNodes = nodes.map(node => {
      const isCompleted = completedNodeIds.has(node.id);
      const isUnlocked = canAccessNext;

      // Si el estudiante no ha completado con éxito este nodo, el siguiente permanecerá bloqueado
      if (!isCompleted) {
        canAccessNext = false;
      }

      const matchingProgress = userProgress.find(p => p.nodeId === node.id);

      // Anti-Cheat: Sanitizamos el payload para borrar la bandera 'isCorrect' antes de enviarlo al cliente
      const safePayload = node.payload ? {
        ...node.payload,
        questions: node.payload.questions?.map((q: any) => ({
          id: q.id,
          text: q.text,
          options: q.options.map((o: any) => ({
            id: o.id,
            text: o.text
          }))
        })) || []
      } : null;

      return {
        id: node.id,
        title: node.title,
        orderIndex: node.orderIndex,
        isUnlocked,
        isCompleted,
        score: matchingProgress ? matchingProgress.score : null,
        payload: safePayload
      };
    });

    return { success: true, nodes: processedNodes };
  } catch (error) {
    console.error("Error al mapear progreso del estudiante:", error);
    return { success: false, error: "No se pudo construir la línea de progreso." };
  }
}