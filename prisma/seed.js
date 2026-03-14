"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...\n');
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
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@uniclubs.com' },
        update: {},
        create: {
            email: 'admin@uniclubs.com',
            password: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: client_1.UserRole.SUPER_ADMIN,
            onboardingCompleted: true,
        },
    });
    console.log(`  ✓ SUPER_ADMIN: ${admin.email} (password: Admin@1234)`);
    const user1Password = await bcrypt.hash('User@1234', 12);
    const user1 = await prisma.user.upsert({
        where: { email: 'alice@uniclubs.com' },
        update: {},
        create: {
            email: 'alice@uniclubs.com',
            password: user1Password,
            firstName: 'Alice',
            lastName: 'Johnson',
            role: client_1.UserRole.USER,
            onboardingCompleted: true,
        },
    });
    console.log(`  ✓ USER: ${user1.email} (password: User@1234)`);
    for (const interest of interests) {
        await prisma.userInterest.upsert({
            where: { userId_interestId: { userId: user1.id, interestId: interest.id } },
            update: {},
            create: { userId: user1.id, interestId: interest.id },
        });
    }
    console.log(`    → interests: ${interestNames.join(', ')}`);
    const user2Password = await bcrypt.hash('User@1234', 12);
    const user2 = await prisma.user.upsert({
        where: { email: 'bob@uniclubs.com' },
        update: {},
        create: {
            email: 'bob@uniclubs.com',
            password: user2Password,
            firstName: 'Bob',
            lastName: 'Smith',
            role: client_1.UserRole.USER,
            onboardingCompleted: false,
        },
    });
    console.log(`  ✓ USER: ${user2.email} (password: User@1234, onboarding pending)`);
    await prisma.userInterest.upsert({
        where: { userId_interestId: { userId: user2.id, interestId: interests[0].id } },
        update: {},
        create: { userId: user2.id, interestId: interests[0].id },
    });
    console.log(`    → interests: ${interests[0].name}`);
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
//# sourceMappingURL=seed.js.map