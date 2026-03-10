import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
  title: 'Registro de Auditoría | Admin',
};

export default async function AuditLogsPage() {
  // 1. Proteger la ruta (Opcional, pero recomendado asegurar que sea Admin)
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // 2. Obtener los logs más recientes (últimos 100 para empezar)
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { name: true, email: true } // Traemos los datos del Admin/Seller
      }
    }
  });

  // Helper para formatear la fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Helper para dar color a los "badges" de acción
  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('GENERATED')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('DELETED')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Auditoría</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial de las últimas 100 acciones en la plataforma y accesos de seguridad.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor (Quién)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad / Propiedad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay registros de auditoría todavía.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    {/* FECHA */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* ACCIÓN (BADGE) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* ACTOR (Lógica combinada Interno/Externo) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{log.user.name || 'Admin'}</span>
                          <span className="text-xs text-gray-500">{log.user.email}</span>
                          <span className="text-xs text-blue-600 font-semibold mt-0.5">Staff/Interno</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{log.contactName || 'Desconocido'}</span>
                          <span className="text-xs text-gray-500">{log.contactPhone}</span>
                          <span className="text-xs text-purple-600 font-semibold mt-0.5">Cliente/Externo</span>
                        </div>
                      )}
                    </td>

                    {/* ENTIDAD / PROPIEDAD */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {log.entityType} {log.entityType === 'PROPERTY' ? '🏠' : log.entityType === 'LOCKBOX' ? '🔑' : ''}
                        </span>
                        {log.address && (
                          <span className="text-xs text-gray-600 mt-1 line-clamp-1" title={log.address}>
                            {log.address}
                          </span>
                        )}
                        {log.entityId && (
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[150px]" title={log.entityId}>
                            ID: {log.entityId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DETALLES */}
                    <td className="px-6 py-4 text-gray-600 min-w-[250px]">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}