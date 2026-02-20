import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CodesModule } from './codes/codes.module';

const mongoUri = process.env.MONGODB_URI?.trim();
if (!mongoUri || !mongoUri.startsWith('mongodb')) {
  throw new Error(`MONGODB_URI inválido. Crie backend/.env com MONGODB_URI=mongodb+srv://...`);
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    MongooseModule.forRoot(mongoUri),
    AuthModule,
    CodesModule,
  ],
})
export class AppModule {}
