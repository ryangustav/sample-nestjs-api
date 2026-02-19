import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodesController } from './codes.controller';
import { CodesService } from './codes.service';
import { Code, CodeSchema } from './schemas/code.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
    AuthModule,
  ],
  controllers: [CodesController],
  providers: [CodesService],
})
export class CodesModule {}
