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

  // ── 6) Sample Events ─────────────────────────────────
  const event1 = await prisma.event.upsert({
    where: { id: 'seed-event-1' },
    update: {},
    create: {
      id: 'seed-event-1',
      title: 'Tech Meetup 2026',
      description: 'A meetup for tech enthusiasts — demos, talks, networking.',
      type: 'PUBLIC',
      status: 'PUBLISHED',
      startTime: new Date('2026-04-15T18:00:00Z'),
      endTime: new Date('2026-04-15T20:00:00Z'),
      locationType: 'PHYSICAL',
      location: 'Room 101, Main Building',
      capacity: 100,
      remainingCapacity: 100,
      organizationId: org.id,
      tags: {
        create: [{ tag: 'tech' }, { tag: 'networking' }],
      },
    },
  });
  console.log(`  ✓ Event: ${event1.title} (PUBLISHED)`);

  const event2 = await prisma.event.upsert({
    where: { id: 'seed-event-2' },
    update: {},
    create: {
      id: 'seed-event-2',
      title: 'Hackathon Spring 2026',
      description: '24-hour hackathon open to all university students.',
      type: 'PUBLIC',
      status: 'PUBLISHED',
      startTime: new Date('2026-05-10T09:00:00Z'),
      endTime: new Date('2026-05-11T09:00:00Z'),
      locationType: 'PHYSICAL',
      location: 'Innovation Lab, Building C',
      capacity: 50,
      remainingCapacity: 50,
      organizationId: org.id,
      tags: {
        create: [{ tag: 'hackathon' }, { tag: 'coding' }],
      },
    },
  });
  console.log(`  ✓ Event: ${event2.title} (PUBLISHED)`);

  const event3 = await prisma.event.upsert({
    where: { id: 'seed-event-3' },
    update: {},
    create: {
      id: 'seed-event-3',
      title: 'Workshop: Intro to TypeScript',
      description: 'Beginner-friendly TypeScript workshop.',
      type: 'PUBLIC',
      status: 'DRAFT',
      startTime: new Date('2026-06-01T14:00:00Z'),
      endTime: new Date('2026-06-01T16:00:00Z'),
      locationType: 'ONLINE',
      location: null,
      capacity: null,
      remainingCapacity: null,
      organizationId: org.id,
    },
  });
  console.log(`  ✓ Event: ${event3.title} (DRAFT)`);

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
