import { db, usersTable } from '@workspace/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding Database...');

  // Hash password
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Upsert Admin User
  console.log('Upserting admin user...');
  await db.insert(usersTable).values({
    name: 'System Admin',
    email: 'admin@smarketing.dev',
    passwordHash: passwordHash,
    role: 'super_admin',
    language: 'en',
    isActive: true,
  }).onConflictDoNothing(); // Simply avoid crashing if already there

  console.log('Database seeded successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
