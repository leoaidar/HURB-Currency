import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencySeedService implements OnModuleInit {

    private readonly currencies: Partial<Currency>[] = [
        { name: 'USD', description: 'North American Dollar', rate: 1 },
        { name: 'BRL', description: 'Brazilian Real', rate: 5.7 },
        { name: 'EUR', description: 'Union European money', rate: 1.15 },
        { name: 'ETH', description: 'Ethereum crypto', rate: 10 },
        { name: 'BTC', description: 'Bitcoin', rate: 100 },
    ];

    constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

    async onModuleInit() {
        await this.seedCurrencies();
    }

    private async seedCurrencies() {
        
        for (let currencyData of this.currencies) {
            const existingCurrency = await this.currencyModel.findOne({ name: currencyData.name }).exec();

            if (!existingCurrency) {
                const newCurrency = new this.currencyModel(currencyData);
                await newCurrency.save();
            }
        }
        console.log('Currency seeding populated with success!');
    }

}