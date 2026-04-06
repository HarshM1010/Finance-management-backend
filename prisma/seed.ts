// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient, RecordType } from './generated/prisma/client';

// const prisma = new PrismaClient({
//   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
// });

// async function main() {
//   console.log('🌱 Seeding...');

//   // 🔹 Helper to generate past dates
//   const daysAgo = (n: number) => {
//     const d = new Date();
//     d.setDate(d.getDate() - n);
//     return d;
//   };

//   // 🔹 Create Records
//   const recordsData = [
//     // INCOME
//     {
//       amount: 5000,
//       type: RecordType.INCOME,
//       categoryId: 'd900ac50-313e-451e-9473-52d4597e87ab',
//       date: daysAgo(1),
//       notes: 'Monthly salary',
//     },
//     {
//       amount: 3000,
//       type: RecordType.INCOME,
//       categoryId: '9e28499d-89f4-4b82-b947-d9738fff1563',
//       date: daysAgo(20),
//       notes: 'invested stocks',
//     },

//     // EXPENSE - Food
//     {
//       amount: 200,
//       type: RecordType.EXPENSE,
//       categoryId: '57b2ebe3-21c3-4909-8b11-700a1d92afa9',
//       date: daysAgo(1),
//       notes: 'Lunch',
//     },
//     {
//       amount: 300,
//       type: RecordType.EXPENSE,
//       categoryId: '57b2ebe3-21c3-4909-8b11-700a1d92afa9',
//       date: daysAgo(3),
//       notes: 'Dinner',
//     },
//     {
//       amount: 150,
//       type: RecordType.EXPENSE,
//       categoryId: 'fdbdf861-3c00-4c34-8d0f-cf847749ae2b',
//       date: daysAgo(10),
//       notes: 'expense for travel',
//     },
//   ];

//   for (const record of recordsData) {
//     await prisma.financialRecord.create({
//       data: {
//         ...record,
//         createdById: 'a14ebc36-53a5-4173-baad-8abc02428478',
//       },
//     });
//   }

//   console.log('✅ Seeding completed');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
