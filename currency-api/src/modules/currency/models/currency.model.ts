import * as mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICurrency {
  id: string; 
  name: string;
  rate: number;
}

const currencySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  rate: { type: Number, required: true }
});

const Currency = mongoose.model<ICurrency & mongoose.Document>('Currency', currencySchema);

export default Currency;