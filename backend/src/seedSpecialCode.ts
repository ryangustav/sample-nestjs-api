import * as mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const SpecialCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  durationHours: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    const SpecialCode = mongoose.model('SpecialCode', SpecialCodeSchema);

    const expiresAt = new Date(2026, 1, 28, 23, 59, 59);

    const existing = await SpecialCode.findOne({ code: 'FreeUser12Hours' });
    if (existing) {
      await SpecialCode.updateOne(
        { code: 'FreeUser12Hours' },
        { $set: { durationHours: 12, expiresAt, active: true } },
      );
      console.log('FreeUser12Hours atualizado.');
    } else {
      await SpecialCode.create({
        code: 'FreeUser12Hours',
        durationHours: 12,
        expiresAt,
        active: true,
      });
      console.log('FreeUser12Hours criado com sucesso!');
    }

    console.log('  Código: FreeUser12Hours');
    console.log('  Duração: 12 horas por dispositivo');
    console.log('  Válido até: 28/02/2026');
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
