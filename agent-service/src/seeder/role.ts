import mongoose from 'mongoose';
import { Role, IRole } from '../models/Role'; 

const MONGO_URI ='mongodb://localhost:27017/'; 

const seedRoles = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const roles: IRole['name'][] = ['creator', 'user'];

    for (const roleName of roles) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`✅ Role '${roleName}' created.`);
      } else {
        console.log(`ℹ️  Role '${roleName}' already exists.`);
      }
    }

    console.log('🎉 Role seeding completed.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();
