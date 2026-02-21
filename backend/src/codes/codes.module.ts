import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodesController } from './codes.controller';
import { CodesService } from './codes.service';
import { Code, CodeSchema } from './schemas/code.schema';
import { SpecialCode, SpecialCodeSchema } from './schemas/special-code.schema';
import { SpecialCodeUsage, SpecialCodeUsageSchema } from './schemas/special-code-usage.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Code.name, schema: CodeSchema },
      { name: SpecialCode.name, schema: SpecialCodeSchema },
      { name: SpecialCodeUsage.name, schema: SpecialCodeUsageSchema },
    ]),
    AuthModule,
  ],
  controllers: [CodesController],
  providers: [CodesService],
})
export class CodesModule {}
