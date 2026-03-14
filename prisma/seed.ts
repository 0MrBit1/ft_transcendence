import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1) Interests ──────────────────────────────────────
  const interestNames = ['sports', 'music', 'technology'];
  const interests = [];

  for (const name of interestNames) {
    const interest = await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    interests.push(interest);
    console.log(`  ✓ Interest: ${interest.name}`);
  }

  // ── 2) SUPER_ADMIN user ───────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@uniclubs.com' },
    update: {},
    create: {
      email: 'admin@uniclubs.com',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      onboardingCompleted: true,
    },
  });
  console.log(`  ✓ SUPER_ADMIN: ${admin.email} (password: Admin@1234)`);

  // ── 3) Normal user 1 ─────────────────────────────────
  const user1Password = await bcrypt.hash('User@1234', 12);
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@uniclubs.com' },
    update: {},
    create: {
      email: 'alice@uniclubs.com',
      password: user1Password,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.USER,
      onboardingCompleted: true,
    },
  });
  console.log(`  ✓ USER: ${user1.email} (password: User@1234)`);

  // Assign interests to user1
  for (const interest of interests) {
    await prisma.userInterest.upsert({
      where: { userId_interestId: { userId: user1.id, interestId: interest.id } },
      update: {},
      create: { userId: user1.id, interestId: interest.id },
    });
  }
  console.log(`    → interests: ${interestNames.join(', ')}`);

  // ── 4) Normal user 2 ─────────────────────────────────
  const user2Password = await bcrypt.hash('User@1234', 12);
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@uniclubs.com' },
    update: {},
    create: {
      email: 'bob@uniclubs.com',
      password: user2Password,
      firstName: 'Bob',
      lastName: 'Smith',
      role: UserRole.USER,
      onboardingCompleted: false,
    },
  });
  console.log(`  ✓ USER: ${user2.email} (password: User@1234, onboarding pending)`);

  // Assign 1 interest to user2
  await prisma.userInterest.upsert({
    where: { userId_interestId: { userId: user2.id, interestId: interests[0].id } },
    update: {},
    create: { userId: user2.id, interestId: interests[0].id },
  });
  console.log(`    → interests: ${interests[0].name}`);

  // ── 5) Test Organization (with approved request) ──────
  const orgRequest = await prisma.organizationRequest.upsert({
    where: { id: 'seed-org-request-1' },
    update: {},
    create: {
      id: 'seed-org-request-1',
      name: 'Tech Society',
      description: 'A club for tech enthusiasts',
      status: 'APPROVED',
      requestedById: user1.id,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  const org = await prisma.organization.upsert({
    where: { requestId: orgRequest.id },
    update: {},
    create: {
      name: 'Tech Society',
      description: 'A club for tech enthusiasts',
      requestId: orgRequest.id,
    },
  });
  console.log(`  ✓ Organization: ${org.name} (id: ${org.id})`);

  // Make user1 an ADMIN of the org
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user1.id } },
    update: {},
    create: { organizationId: org.id, userId: user1.id, role: 'ADMIN' },
  });
  console.log(`    → Alice is ADMIN`);

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
