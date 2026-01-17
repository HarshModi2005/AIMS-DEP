
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const sessions = await prisma.academicSession.findMany();
  console.log('Sessions:', sessions);
  const faculty = await prisma.faculty.findMany({ include: { user: true } });
  console.log('Faculty count:', faculty.length);
  if (faculty.length > 0) console.log('First faculty:', faculty[0].user.firstName, faculty[0].user.lastName, faculty[0].id);
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.());

