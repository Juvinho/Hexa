import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@hexa.com' },
    });

    if (!user) {
      console.log('User test@hexa.com not found.');
      return;
    }

    console.log(`Found user ${user.id}. Deleting related records...`);

    // Delete TrafficMetrics (Restricted)
    await prisma.trafficMetric.deleteMany({
      where: { userId: user.id },
    });
    console.log('Deleted TrafficMetrics.');

    // Delete other related records if not set to Cascade (most are Cascade, but checking)
    // Integration -> Cascade
    // OnboardingStatus -> Cascade
    // RefreshToken -> Cascade
    // PasswordResetToken -> Cascade
    // EmailVerificationToken -> Cascade
    // Settings -> Cascade
    // Lead -> Cascade

    // Now delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`User ${user.email} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
