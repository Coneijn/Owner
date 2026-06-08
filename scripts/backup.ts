// scripts/backup.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando respaldo de datos...');

  // --- Usuarios y Perfiles ---
  const users = await prisma.user.findMany();
  const webuserProfiles = await prisma.webuserProfile.findMany();
  const renterProfiles = await prisma.renterProfile.findMany();
  const sellerProfiles = await prisma.sellerProfile.findMany();
  const agentProfiles = await prisma.agentProfile.findMany();
  const buyerProfiles = await prisma.buyerProfile.findMany();

  // --- Propiedades y Multimedia ---
  const properties = await prisma.property.findMany(); 
  const propertyImages = await prisma.propertyImage.findMany();
  const marketingMaterials = await prisma.marketingMaterial.findMany();

  // --- Blog ---
  const posts = await prisma.post.findMany();
  const postImages = await prisma.postImage.findMany();

  // --- Contratos y Pagos ---
  const contracts = await prisma.contract.findMany();
  const payments = await prisma.payment.findMany();
  const leaseAgreements = await prisma.leaseAgreement.findMany();
  const rentalPayments = await prisma.rentalPayment.findMany();

  // --- Sistema y Logs ---
  const auditLogs = await prisma.auditLog.findMany();
  const messages = await prisma.message.findMany();
  const selectionSessions = await prisma.selectionSession.findMany();
  const lockboxAccesses = await prisma.lockboxAccess.findMany();
  const verificationTokens = await prisma.verificationToken.findMany();

  const data = {
    users,
    webuserProfiles,
    renterProfiles,
    sellerProfiles,
    agentProfiles,
    buyerProfiles,
    properties,
    propertyImages,
    marketingMaterials,
    posts,
    postImages,
    contracts,
    payments,
    leaseAgreements,
    rentalPayments,
    auditLogs,
    messages,
    selectionSessions,
    lockboxAccesses,
    verificationTokens
  };

  const outputPath = path.join(__dirname, '../prisma/seed-data.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Respaldo COMPLETO guardado en: ${outputPath}`);
  console.log(`   - Usuarios base: ${users.length}`);
  console.log(`   - Propiedades: ${properties.length}`);
  console.log(`   - Contratos/Préstamos: ${contracts.length}`);
  console.log(`   - Rentas: ${leaseAgreements.length}`);
  console.log(`   - Mensajes internos: ${messages.length}`);
  console.log(`   - Artículos de Blog: ${posts.length}`);
  console.log('¡Todas las tablas han sido respaldadas con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });