import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Stable UUIDs for seed data (so controller's ParseUUIDPipe accepts them)
const SEED_EVENT_1 = '00000000-0000-4000-a000-000000000001';
const SEED_EVENT_2 = '00000000-0000-4000-a000-000000000002';
const SEED_EVENT_3 = '00000000-0000-4000-a000-000000000003';

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
      isOrganizer: true,
    },
  });
  console.log(`  ✓ SUPER_ADMIN: ${admin.email} (password: Admin@1234)`);

  // ── 3) Normal user 1 (organizer) ──────────────────────
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
      isOrganizer: true,
      onboardingCompleted: true,
    },
  });
  console.log(`  ✓ USER (organizer): ${user1.email} (password: User@1234)`);

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

  // ── 5) Sample Events (organized by user1) ─────────────
  const event1 = await prisma.event.upsert({
    where: { id: SEED_EVENT_1 },
    update: {},
    create: {
      id: SEED_EVENT_1,
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
      organizerId: user1.id,
      tags: {
        create: [{ tag: 'tech' }, { tag: 'networking' }],
      },
    },
  });
  console.log(`  ✓ Event: ${event1.title} (PUBLISHED)`);

  const event2 = await prisma.event.upsert({
    where: { id: SEED_EVENT_2 },
    update: {},
    create: {
      id: SEED_EVENT_2,
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
      organizerId: user1.id,
      tags: {
        create: [{ tag: 'hackathon' }, { tag: 'coding' }],
      },
    },
  });
  console.log(`  ✓ Event: ${event2.title} (PUBLISHED)`);

  const event3 = await prisma.event.upsert({
    where: { id: SEED_EVENT_3 },
    update: {},
    create: {
      id: SEED_EVENT_3,
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
      organizerId: user1.id,
    },
  });
  console.log(`  ✓ Event: ${event3.title} (DRAFT)`);

  // ── 6) Sample Bookings ────────────────────────────────
  const booking1 = await prisma.booking.upsert({
    where: { eventId_userId: { eventId: event1.id, userId: user2.id } },
    update: {},
    create: {
      eventId: event1.id,
      userId: user2.id,
      status: 'CONFIRMED',
    },
  });
  console.log(`  ✓ Booking: Bob → ${event1.title} (CONFIRMED)`);

  const booking2 = await prisma.booking.upsert({
    where: { eventId_userId: { eventId: event2.id, userId: user2.id } },
    update: {},
    create: {
      eventId: event2.id,
      userId: user2.id,
      status: 'PENDING',
    },
  });
  console.log(`  ✓ Booking: Bob → ${event2.title} (PENDING)`);

  // ── 7) Sample Notifications ───────────────────────────
  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: `Your booking for "${event1.title}" has been confirmed!`,
      metadata: { eventId: event1.id },
    },
  });
  console.log(`  ✓ Notification: Booking confirmed for Bob`);

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
