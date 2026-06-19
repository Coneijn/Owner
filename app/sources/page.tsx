import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Importamos Prisma para buscar la info de la carpeta
import { getFolderContents } from "@/lib/source-actions";
import { Folder } from "lucide-react"; 
import Link from "next/link";

interface Props {
  searchParams: Promise<{ folderId?: string; tab?: string }>;
}

import CreateFolderButton from "./components/CreateFolderButton";
import UploadFileButton from "./components/UploadFileButton";
import DeleteSourceButton from "./components/DeleteSourceButton";
import EditFolderButton from "./components/EditFolderButton";
import FileCard from "./components/FileCard";
import ActivitiesView from "./components/ActivitiesView"; // 👈 Nuevo componente del Tren

export default async function SourcesPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const currentFolderId = resolvedSearchParams.folderId || null;
  const currentTab = resolvedSearchParams.tab || "files";

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    redirect("/activities");
  }

  const { folders = [], files = [] } = await getFolderContents(currentFolderId);

  // Buscar el nombre de la carpeta actual si estamos dentro de una
  const currentFolder = currentFolderId 
    ? await prisma.mediaFolder.findUnique({ where: { id: currentFolderId } }) 
    : null;

  // Buscar todos los cursos (Trenes) para pasarlos a la vista de Actividades
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-accent tracking-tight">
            {currentFolder ? currentFolder.name : "Files and Resources"}
          </h1>
          <p className="text-gray-400 mt-2 text-base">
            {currentFolder 
              ? "Viewing the contents of this folder" 
              : "Explore the available audiovisual material"}
          </p>
        </div>

        {/* 👇 SOLO VISIBLE PARA EL ADMIN 👇 */}
        {isAdmin && currentTab === "files" && (
          <div className="flex gap-3">
            <CreateFolderButton parentId={currentFolderId} />
            <UploadFileButton folderId={currentFolderId} />
          </div>
        )}
      </div>

      {/* Navegación por Pestañas (Tabs) */}
      <div className="flex border-b border-gray-200 mb-8">
        <Link 
          href={`/sources?tab=files${currentFolderId ? `&folderId=${currentFolderId}` : ''}`}
          className={`py-3 px-6 text-base font-bold border-b-4 transition-colors ${currentTab === "files" ? "border-brand-accent text-brand-accent" : "border-transparent text-gray-500 hover:text-white hover:border-white/30"}`}
        >
          Files
        </Link>
        <Link 
          href={`/sources?tab=activities`}
          className={`py-3 px-6 text-base font-bold border-b-4 transition-colors ${currentTab === "activities" ? "border-brand-accent text-brand-accent" : "border-transparent text-gray-500 hover:text-white hover:border-white/30"}`}
        >
          Activities
        </Link>
      </div>

      {currentTab === "files" ? (
        <>
      {/* Sección de Carpetas */}
      {(folders.length > 0 || currentFolderId) && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {currentFolderId && (
              <Link href="/sources" className="text-sm text-blue-600 hover:underline font-medium">
                &larr; Go Back
              </Link>
            )}
            <h2 className="text-lg font-semibold text-gray-400">Folders</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <div 
                key={folder.id} 
                className="group relative flex flex-col items-center bg-white border rounded-xl hover:shadow-md transition"
              >
                {/* El enlace cubre el icono y el texto */}
                <Link 
                  href={`/sources?folderId=${folder.id}`}
                  className="flex flex-col items-center w-full p-4 cursor-pointer"
                >
                  <Folder className="w-12 h-12 text-yellow-500 mb-2 fill-yellow-500/20" />
                  <span className="text-sm font-medium text-gray-700 text-center truncate w-full">
                    {folder.name}
                  </span>
                </Link>

                {/* Botones de acción rápidos flotantes - SOLO PARA ADMIN */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md shadow-sm">
                    <EditFolderButton id={folder.id} currentName={folder.name} />
                    <DeleteSourceButton id={folder.id} type="folder" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-400 mb-5">Files</h2>
        {files.length === 0 && folders.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-lg font-medium">
            This folder is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
        </>
      ) : (
        <ActivitiesView isAdmin={isAdmin} courses={courses} />
      )}
    </div>
  );
}