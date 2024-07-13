import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Currency {
  @Prop({ required: true, unique: true, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  rate: number;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
export type CurrencyDocument = Document & {
  id: string;
  name: string;
  rate: number;
};


// import * as mongoose from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

// export interface ICurrency {
//   id: string; 
//   name: string;
//   rate: number;
// }

// const currencySchema = new mongoose.Schema({
//   id: { type: String, required: true, unique: true, default: uuidv4 },
//   name: { type: String, required: true },
//   rate: { type: Number, required: true }
// });

// const Currency = mongoose.model<ICurrency & mongoose.Document>('Currency', currencySchema);

// export default Currency;
