import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-network' },
    update: {},
    create: {
      name: 'Demo Fuel Network',
      slug: 'demo-network',
      fuelGrades: {
        create: [
          { code: 1, name: 'A-95', color: '#2f7df6' },
          { code: 2, name: 'Diesel', color: '#2f9f61' },
          { code: 3, name: 'LPG', color: '#f0a22e' }
        ]
      }
    },
    include: { fuelGrades: true }
  });

  const station = await prisma.station.upsert({
    where: { organizationId_number: { organizationId: organization.id, number: 4 } },
    update: {},
    create: {
      organizationId: organization.id,
      number: 4,
      name: 'АЗС №4',
      city: 'Київ',
      address: 'Демо-адреса, 4',
      controllers: {
        create: {
          ptsId: 'PTS-DEMO-0004',
          name: 'PTS-2 Demo Controller',
          basicUsername: 'pts-demo'
        }
      }
    },
    include: { controllers: true }
  });

  const adminRole = await prisma.role.upsert({
    where: { organizationId_key: { organizationId: organization.id, key: 'owner' } },
    update: {},
    create: {
      organizationId: organization.id,
      key: 'owner',
      name: 'Власник',
      permissions: ['*']
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: { status: 'ACTIVE' },
    create: {
      organizationId: organization.id,
      email: 'owner@example.com',
      name: 'Demo Owner',
      status: 'ACTIVE',
      roles: { create: { roleId: adminRole.id } },
      stationScopes: { create: { stationId: station.id, roleId: adminRole.id } }
    }
  });

  await prisma.card.upsert({
    where: { organizationId_tag: { organizationId: organization.id, tag: '000000000001' } },
    update: {},
    create: {
      organizationId: organization.id,
      tag: '000000000001',
      status: 'ACTIVE',
      accountType: 'PREPAID',
      cardholderName: 'Demo Driver',
      companyName: 'Demo Logistics',
      vehicleNumber: 'AA0001AA',
      balance: '25000.00',
      dailyLimit: '5000.00',
      monthlyLimit: '50000.00',
      allowedFuelGradeIds: [1, 2]
    }
  });

  console.log({ organization: organization.slug, station: station.number, controller: station.controllers[0]?.ptsId, user: user.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
