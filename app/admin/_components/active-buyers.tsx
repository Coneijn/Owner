import { prisma } from '@/lib/prisma';
import {
  buildContractSnapshot,
  sortByUrgency,
  type ContractWithRelations,
} from '@/lib/contract-snapshot';
import ActiveBuyersClient from './active-buyers-client';

export default async function ActiveBuyers() {
  const contracts = (await prisma.contract.findMany({
    where: { isActive: true },
    include: {
      property: true,
      buyers: { include: { user: true } },
      payments: { orderBy: { paymentDate: 'asc' } },
    },
    orderBy: { startDate: 'desc' },
    take: 200,
  })) as ContractWithRelations[];

  const snapshots = contracts.map(buildContractSnapshot).sort(sortByUrgency);

  return <ActiveBuyersClient contracts={snapshots} />;
}