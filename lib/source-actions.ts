'use server';

import prisma from './prisma'; // Asegúrate de que esta ruta apunte a tu cliente de Prisma
import { revalidatePath } from 'next/cache';

// --- ACCIONES PARA CARPETAS ---

export async function createFolder(name: string, parentId: string | null = null) {
  try {
    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        parentId,
      },
    });
    
    // Refrescar las rutas de admin y públicas
    revalidatePath('/admin/sources');
    revalidatePath('/sources');
    
    return { success: true, folder };
  } catch (error) {
    console.error("Error al crear carpeta:", error);
    return { success: false, error: "No se pudo crear la carpeta" };
  }
}

export async function editFolder(id: string, newName: string) {
  try {
    const folder = await prisma.mediaFolder.update({
      where: { id },
      data: { name: newName },
    });
    
    revalidatePath('/admin/sources');
    revalidatePath('/sources');
    
    return { success: true, folder };
  } catch (error) {
    console.error("Error al editar carpeta:", error);
    return { success: false, error: "No se pudo editar la carpeta" };
  }
}

export async function deleteFolder(id: string) {
  try {
    // Al usar onDelete: Cascade en Prisma, borrar una carpeta
    // borrará automáticamente sus subcarpetas y los registros de sus archivos en la DB.
    await prisma.mediaFolder.delete({
      where: { id },
    });
    
    revalidatePath('/admin/sources');
    revalidatePath('/sources');
    
    return { success: true };
  } catch (error) {
    console.error("Error al borrar carpeta:", error);
    return { success: false, error: "No se pudo borrar la carpeta" };
  }
}

// --- ACCIONES PARA ARCHIVOS ---

interface CreateFileProps {
  name: string;
  url: string;
  type: string;
  size: number;
  folderId: string | null;
}

export async function createFileRecord(data: CreateFileProps) {
  try {
    const file = await prisma.mediaFile.create({
      data: {
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        folderId: data.folderId,
      },
    });
    
    revalidatePath('/admin/sources');
    revalidatePath('/sources');
    
    return { success: true, file };
  } catch (error) {
    console.error("Error al guardar registro del archivo:", error);
    return { success: false, error: "No se pudo guardar el archivo" };
  }
}

export async function deleteFileRecord(id: string) {
  try {
    // Nota: Esto borra el registro en la base de datos. 
    // Para no saturar tu S3, en el futuro podrías agregar lógica 
    // aquí para borrar también el objeto físico de AWS usando @aws-sdk/client-s3
    await prisma.mediaFile.delete({
      where: { id },
    });
    
    revalidatePath('/admin/sources');
    revalidatePath('/sources');
    
    return { success: true };
  } catch (error) {
    console.error("Error al borrar el registro del archivo:", error);
    return { success: false, error: "No se pudo borrar el archivo" };
  }
}

// --- OBTENER CONTENIDO (GET) ---

export async function getFolderContents(folderId: string | null = null) {
  try {
    const folders = await prisma.mediaFolder.findMany({
      where: { parentId: folderId },
      orderBy: { createdAt: 'desc' },
    });

    const files = await prisma.mediaFile.findMany({
      where: { folderId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, folders, files };
  } catch (error) {
    console.error("Error al obtener contenido:", error);
    return { success: false, error: "No se pudo cargar el contenido" };
  }
}