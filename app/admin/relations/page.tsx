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
      data: { 
        buyers: {
          set: [], 
          connect: { id: buyerProfileId }
        }
      },
    });
    revalidatePath("/admin/relations"); 
  }
}

// Acción simplificada solo para asignar DUEÑOS (Sellers)
async function assignSeller(formData: FormData) {
  "use server";
  const propertyId = formData.get("propertyId") as string;
  const profileId = formData.get("profileId") as string;

  if (propertyId && profileId) {
    await prisma.property.update({
      where: { id: propertyId },
      data: { sellerProfileId: profileId },
    });
    revalidatePath("/admin/relations");
  }
}

// NUEVA ACCIÓN: Crear un LeaseAgreement (Asignar Inquilino)
async function createLeaseAgreement(formData: FormData) {
  "use server";
  const propertyId = formData.get("propertyId") as string;
  const renterProfileId = formData.get("profileId") as string;
  const startDateStr = formData.get("startDate") as string;
  const monthlyRent = parseFloat(formData.get("monthlyRent") as string) || 0;
  const securityDeposit = parseFloat(formData.get("securityDeposit") as string) || 0;

  if (propertyId && renterProfileId && startDateStr && monthlyRent > 0) {
    await prisma.leaseAgreement.create({
      data: {
        propertyId,
        renters: {
          connect: { id: renterProfileId }
        },
        startDate: new Date(startDateStr),
        monthlyRent,
        securityDeposit: securityDeposit > 0 ? securityDeposit : null,
      }
    });
    revalidatePath("/admin/relations");
  }
}

// Acción para crear contratos de VENTA / PRÉSTAMO (LOAN)
async function createContract(formData: FormData) {
  "use server";
  const propertyId = formData.get("propertyId") as string;
  const buyerProfileId = formData.get("buyerProfileId") as string;
  const type = formData.get("type") as "LOAN";
  
  const totalAmount = parseFloat(formData.get("totalAmount") as string) || 0;
  const downPayment = parseFloat(formData.get("downPayment") as string) || 0;
  const principalAmount = parseFloat(formData.get("principalAmount") as string) || 0;
  const startDateStr = formData.get("startDate") as string;

  if (propertyId && buyerProfileId && startDateStr) {
    await prisma.contract.create({
      data: {
        propertyId,
        buyers: { connect: { id: buyerProfileId } },
        type,
        totalAmount,
        downPayment,
        principalAmount,
        startDate: new Date(startDateStr),
      },
    });
    revalidatePath("/admin/relations");
  }
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default async function RelationsAdminPage() {
  // 1. Obtener Contratos (LOAN)
  const contracts = await prisma.contract.findMany({
    include: {
      property: true,
      buyers: true, 
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Obtener Propiedades (Incluyendo sus Leases activos para saber si están ocupadas)
  const properties = await prisma.property.findMany({
    include: {
      sellerProfile: true, // El dueño directo
      leases: {            // Los contratos de renta
        where: { isActive: true },
        include: { renters: true }
      }
    },
  });

  // 3. Obtener Catálogos
  const allBuyers = await prisma.buyerProfile.findMany();
  const allSellers = await prisma.sellerProfile.findMany();
  const allRenters = await prisma.renterProfile.findMany();

  // 4. Filtrar propiedades
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
          {/* ================= SECCIÓN: CONTRATOS DE VENTA / PRÉSTAMO ================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-2 bg-brand-accent"></div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Gestión de Créditos (Ventas)</h2>
            </div>

            {/* FORMULARIO PARA CREAR NUEVO CONTRATO (LOAN) */}
            <div className="mb-8 p-6 rounded-xl border border-white/10 bg-black/40 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">+</span> Crear Nuevo Crédito
              </h3>
              <form action={createContract} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Propiedad</label>
                  <select name="propertyId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none">
                    <option value="">Selecciona Propiedad...</option>
                    {saleProperties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Comprador</label>
                  <select name="buyerProfileId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none">
                    <option value="">Selecciona Cliente...</option>
                    {allBuyers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Tipo de Contrato</label>
                  <select name="type" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none">
                    <option value="LOAN">Préstamo / Venta (LOAN)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Fecha de Inicio</label>
                  <input type="date" name="startDate" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Monto Total ($)</label>
                  <input type="number" step="0.01" name="totalAmount" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none" placeholder="0.00" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Enganche ($)</label>
                  <input type="number" step="0.01" name="downPayment" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none" placeholder="0.00" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Capital a Financiar ($)</label>
                  <input type="number" step="0.01" name="principalAmount" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:border-brand-accent outline-none" placeholder="0.00" />
                </div>

                <div className="flex flex-col justify-end">
                  <button type="submit" className="bg-brand-accent text-brand-dark hover:bg-white w-full py-2 rounded-md text-sm font-bold transition-all">
                    Crear Contrato
                  </button>
                </div>
              </form>
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
                  {contracts.map((contract) => {
                    const currentBuyerId = contract.buyers && contract.buyers.length > 0 ? contract.buyers[0].id : "";
                    
                    return (
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
                        <td className="px-6 py-4">
                          <form action={updateContractBuyer} className="flex items-center gap-2">
                            <input type="hidden" name="contractId" value={contract.id} />
                            <select 
                              name="buyerProfileId"
                              defaultValue={currentBuyerId}
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
                    );
                  })}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay contratos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================= SECCIÓN: ASIGNACIÓN RÁPIDA (RENTAS Y DUEÑOS) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. RENTA -> CREAR LEASE Y ASIGNAR INQUILINO */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-2 bg-brand-accent"></div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nuevo Contrato Renta</h2>
              </div>
              
              <form action={createLeaseAgreement} className="bg-black/40 border border-white/10 p-5 rounded-xl shadow-xl flex flex-col gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">1. Propiedad</label>
                  <select name="propertyId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Selecciona propiedad --</option>
                    {rentedProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.address} {p.leases.length > 0 ? '(Ya tiene inquilino)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">2. Inquilino</label>
                  <select name="profileId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Elige inquilino --</option>
                    {allRenters.map(renter => (
                      <option key={renter.id} value={renter.id}>
                        {renter.RenterName || "Sin Nombre"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campos Obligatorios para LeaseAgreement */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">Fecha de Inicio</label>
                  <input type="date" name="startDate" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">Renta Mensual ($)</label>
                  <input type="number" step="0.01" name="monthlyRent" required placeholder="Ej. 1200" className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">Depósito de Seguridad ($)</label>
                  <input type="number" step="0.01" name="securityDeposit" placeholder="Opcional" className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent" />
                </div>

                <div className="mt-2">
                  <button type="submit" className="bg-white/10 hover:bg-brand-accent hover:text-black border border-white/10 text-white px-4 py-2 rounded-md text-sm font-bold transition-all w-full">
                    Crear Lease & Asignar
                  </button>
                </div>
              </form>
            </section>

            {/* 2. RENTA -> DUEÑO (SELLER) */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-2 bg-brand-accent"></div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Asignar Dueño (Renta)</h2>
              </div>
              
              <form action={assignSeller} className="bg-black/40 border border-white/10 p-5 rounded-xl shadow-xl flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">1. Propiedad</label>
                  <select name="propertyId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Selecciona propiedad --</option>
                    {rentedProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.address} {p.sellerProfileId ? '(Tiene dueño)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">2. Dueño / Landlord</label>
                  <select name="profileId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Elige dueño --</option>
                    {allSellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.sellerName || "Sin Nombre"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <button type="submit" className="bg-white/10 hover:bg-brand-accent hover:text-black border border-white/10 text-white px-4 py-2 rounded-md text-sm font-bold transition-all w-full">
                    Actualizar Dueño
                  </button>
                </div>
              </form>
            </section>

            {/* 3. VENTA -> DUEÑO (SELLER) */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-2 bg-brand-accent"></div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Asignar Dueño (Venta)</h2>
              </div>
              
              <form action={assignSeller} className="bg-black/40 border border-white/10 p-5 rounded-xl shadow-xl flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">1. Propiedad</label>
                  <select name="propertyId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Selecciona propiedad --</option>
                    {saleProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.address} {p.sellerProfileId ? '(Tiene dueño)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">2. Dueño / Seller</label>
                  <select name="profileId" required className="bg-black border border-white/20 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-brand-accent">
                    <option value="">-- Elige dueño --</option>
                    {allSellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.sellerName || "Sin Nombre"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <button type="submit" className="bg-white/10 hover:bg-brand-accent hover:text-black border border-white/10 text-white px-4 py-2 rounded-md text-sm font-bold transition-all w-full">
                    Actualizar Dueño
                  </button>
                </div>
              </form>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}