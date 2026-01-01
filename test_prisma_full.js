const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: "0d6b6107-e1b8-4ba9-af96-c1fd77e445b3" },
            select: { loyaltyPoints: true, phone: true, address: true }
        });
        console.log('User data:', JSON.stringify(user, null, 2));
    } catch (err) {
        console.error('Prisma Error:', err.message);
    }
}

main()
    .finally(async () => await prisma.$disconnect());
