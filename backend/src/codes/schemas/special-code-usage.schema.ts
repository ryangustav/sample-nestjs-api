import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SpecialCodeUsage extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  firstUsedAt: Date;

  @Prop({ default: 'FreeUser' })
  nome: string;
}

export const SpecialCodeUsageSchema = SchemaFactory.createForClass(SpecialCodeUsage);

SpecialCodeUsageSchema.index({ code: 1, deviceId: 1 }, { unique: true });
