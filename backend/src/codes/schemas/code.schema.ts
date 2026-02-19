import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Code extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true })
  tempo: Date;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;
}

export const CodeSchema = SchemaFactory.createForClass(Code);

CodeSchema.virtual('expired').get(function () {
  return new Date() > this.tempo;
});
