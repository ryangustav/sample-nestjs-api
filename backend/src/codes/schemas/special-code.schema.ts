import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SpecialCode extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  durationHours: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: true })
  active: boolean;
}

export const SpecialCodeSchema = SchemaFactory.createForClass(SpecialCode);
