import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'currencies' })
export class Currency {
  @Prop({ required: true, unique: true, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  description: string;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);

export type CurrencyDocument = Document & {
  id: string;
  code: string;
  rate: number;
  description: string;
};
