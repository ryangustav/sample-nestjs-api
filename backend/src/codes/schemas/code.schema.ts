import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Code extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  tempo: number | Date;

  @Prop({ type: Date, default: null })
  firstUsedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;
}

export const CodeSchema = SchemaFactory.createForClass(Code);

CodeSchema.virtual('expired').get(function () {
  if (this.firstUsedAt) {
    if (typeof this.tempo === 'number') {
      const tempoMs = this.tempo * 60 * 60 * 1000;
      return new Date().getTime() > this.firstUsedAt.getTime() + tempoMs;
    }
  }
  if (this.tempo instanceof Date) {
    return new Date() > this.tempo;
  }
  return false;
});
