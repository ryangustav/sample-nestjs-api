import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    const Admin = mongoose.model('Admin', AdminSchema);

    await Admin.deleteMany({});
    console.log('Admins anteriores removidos.');

    const hashedPassword = await bcrypt.hash('@Kgzin5555', 12);
    await Admin.create({
      username: 'onlykgzin',
      password: hashedPassword,
    });

    console.log('Admin criado com sucesso!');
    console.log('  Username: onlykgzin');
    console.log('  Password: @Kgzin5555');
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
