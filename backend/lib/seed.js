import { PrismaClient } from '@prisma/client'
import { LibsqlAdapter } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const client = createClient({ url: 'file:./prisma/dev.db' })
const adapter = new LibsqlAdapter(client)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CARETAKER',
      caretaker: {
        create: {
          bio: 'Experienced nurse with 8 years in elderly care.',
          hourlyRate: 25,
          availability: 'weekdays',
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      name: 'James Lee',
      email: 'james@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CARETAKER',
      caretaker: {
        create: {
          bio: 'Certified caregiver specializing in disability support.',
          hourlyRate: 20,
          availability: 'weekends',
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      name: 'Anna Reyes',
      email: 'anna@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CARESEEKER',
      careSeeker: {
        create: {
          address: '123 Maple Street',
          notes: 'Looking for help with elderly mother, weekdays preferred.',
        },
      },
    },
  })

  console.log('✅ Database seeded!')
  console.log('   Caretaker: maria@example.com / password123')
  console.log('   Caretaker: james@example.com / password123')
  console.log('   CareSeeker: anna@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
