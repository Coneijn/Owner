import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";

// ==========================================
// SERVER ACTIONS (Lógica CRUD)
// ==========================================

async function updateContractBuyer(formData: FormData) {
  "use server";
  const contractId = formData.get("contractId") as string;
  const buyerProfileId = formData.get("buyerProfileId") as string;

  if (contractId && buyerProfileId) {
    await prisma.contract.update({
      where: { id: contractId },
      data: { buyerProfileId },
    });
    revalidatePath("/admin/relations"); // Cambia esta ruta si tu archivo está en otro path
  }
}

async function updatePropertyProfile(formData: FormData) {
  "use server";
  const propertyId = formData.get("propertyId") as string;
  const profileType = formData.get("profileType") as string; // 'seller' o 'renter'
  const profileId = formData.get("profileId") as string;

  if (propertyId && profileType) {
    const dataToUpdate =
      profileType === "seller"
        ? { sellerProfileId: profileId || null }
        : { renterProfileId: profileId || null };

    await prisma.property.update({
      where: { id: propertyId },
      data: dataToUpdate,
    });
    revalidatePath("/admin/relations");
  }
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default async function RelationsAdminPage() {
  // 1. Obtener los datos principales
  const contracts = await prisma.contract.findMany({
    include: {
      property: true,
      buyer: true, // buyerProfile 
    },
    orderBy: { createdAt: "desc" },
  });

  const properties = await prisma.property.findMany({
    include: {
      renterProfile: true,
      sellerProfile: true,
    },
  });

  // 2. Obtener los catálogos para los Dropdowns (Listas de selección)
  const allBuyers = await prisma.buyerProfile.findMany();
  const allSellers = await prisma.sellerProfile.findMany();
  const allRenters = await prisma.renterProfile.findMany();

  // 3. Filtrar propiedades para las vistas en la interfaz
  const rentedProperties = properties.filter((p) => p.isForRent);
  const saleProperties = properties.filter((p) => p.isForSale);

  return (
    <div className="min-h-screen bg-brand-dark text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-l-4 border-brand-accent pl-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Panel de Relaciones <span className="text-brand-accent">Interno</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Administración y asignación de vínculos entre contratos, propiedades y clientes.
          </p>
        </header>

        <div className="space-y-12">
          {/* ================= SECCIÓN: CONTRATOS ================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-2 bg-brand-accent"></div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Gestión de Contratos</h2>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-2xl">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-accent uppercase">ID / Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-accent uppercase">Propiedad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-accent uppercase">Monto Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-accent uppercase">Asignar Comprador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block text-sm font-mono text-gray-300">{contract.id.slice(-8)}</span>
                        <span className="inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-accent text-brand-dark uppercase">
                          {contract.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{contract.property.address}</div>
                        <div className="text-xs text-gray-500">{contract.property.city}, {contract.property.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-brand-accent">
                          ${Number(contract.totalAmount).toLocaleString()}
                        </div>
                      </td>
                      {/* FORMULARIO INLINE PARA ACTUALIZAR CONTRATO */}
                      <td className="px-6 py-4">
                        <form action={updateContractBuyer} className="flex items-center gap-2">
                          <input type="hidden" name="contractId" value={contract.id} />
                          <select 
                            name="buyerProfileId"
                            defaultValue={contract.buyerProfileId || ""}
                            className="bg-black/50 border border-white/20 text-white text-sm rounded-md px-3 py-1.5 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none w-full max-w-[200px]"
                          >
                            <option value="" disabled>Seleccionar comprador...</option>
                            {allBuyers.map(buyer => (
                              <option key={buyer.id} value={buyer.id}>
                                {buyer.firstName} {buyer.lastName}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="bg-white/10 hover:bg-brand-accent hover:text-black text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all">
                            Guardar
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay contratos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================= GRID DE PROPIEDADES ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* RENTADORES */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
                Inmuebles en Renta (Asignar Inquilino)
              </h3>
              <div className="space-y-4">
                {rentedProperties.map((p) => (
                  <div key={p.id} className="bg-black/20 border border-white/5 p-4 rounded-lg hover:border-brand-accent/30 transition-all">
                    <p className="text-white font-bold">{p.address}</p>
                    
                    <form action={updatePropertyProfile} className="mt-4 flex flex-col gap-2">
                      <input type="hidden" name="propertyId" value={p.id} />
                      <input type="hidden" name="profileType" value="renter" />
                      
                      <div className="flex gap-2 w-full">
                        <select 
                          name="profileId"
                          defaultValue={p.renterProfileId || ""}
                          className="bg-black border border-white/10 text-gray-300 text-sm rounded-md px-3 py-2 flex-grow focus:border-brand-accent outline-none"
                        >
                          <option value="">-- Sin inquilino asignado --</option>
                          {allRenters.map(renter => (
                            <option key={renter.id} value={renter.id}>
                              {renter.RenterName || "Sin Nombre"} ({renter.phone || "Sin Teléfono"})
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="bg-brand-accent/20 text-brand-accent border border-brand-accent/50 hover:bg-brand-accent hover:text-black px-4 py-2 rounded-md text-sm font-bold transition-all">
                          Actualizar
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </section>

            {/* VENDEDORES / DUEÑOS */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
                Inmuebles en Venta (Asignar Dueño/Seller)
              </h3>
              <div className="space-y-4">
                {saleProperties.map((p) => (
                  <div key={p.id} className="bg-black/20 border border-white/5 p-4 rounded-lg hover:border-brand-accent/30 transition-all">
                    <p className="text-white font-bold">{p.address}</p>
                    
                    <form action={updatePropertyProfile} className="mt-4 flex flex-col gap-2">
                      <input type="hidden" name="propertyId" value={p.id} />
                      <input type="hidden" name="profileType" value="seller" />
                      
                      <div className="flex gap-2 w-full">
                        <select 
                          name="profileId"
                          defaultValue={p.sellerProfileId || ""}
                          className="bg-black border border-white/10 text-gray-300 text-sm rounded-md px-3 py-2 flex-grow focus:border-brand-accent outline-none"
                        >
                          <option value="">-- Sin dueño asignado --</option>
                          {allSellers.map(seller => (
                            <option key={seller.id} value={seller.id}>
                              {seller.sellerName || "Sin Nombre"} ({seller.sellerType})
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="bg-brand-accent/20 text-brand-accent border border-brand-accent/50 hover:bg-brand-accent hover:text-black px-4 py-2 rounded-md text-sm font-bold transition-all">
                          Actualizar
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}