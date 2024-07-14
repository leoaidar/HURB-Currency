import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencySeedService implements OnModuleInit {
    
    private readonly logger = new Logger(CurrencySeedService.name);

    private readonly currencies: Partial<Currency>[] = [
        { code: 'USD', description: 'The United States dollar (symbol: $; currency code: USD; also abbreviated US$ to distinguish it from other dollar-denominated currencies; referred to as the dollar, U.S. dollar, American dollar, or colloquially buck) is the official currency of the United States and several other countries.', rate: 1 },
        { code: 'BRL', description: 'The Brazilian real (pl. reais; sign: R$; code: BRL) is the official currency of Brazil.', rate: 5.7 },               
        { code: 'EUR', description: 'The euro (symbol: €; currency code: EUR) is the official currency of 20 of the 27 member states of the European Union.', rate: 1.15 },
        { code: 'BTC', description: 'Bitcoin (abbreviation: BTC; sign: ₿) is the first decentralized cryptocurrency. Nodes in the peer-to-peer bitcoin network verify transactions through cryptography and record them in a public distributed ledger, called a blockchain, without central oversight.', rate: 100 },
        { code: 'ETH', description: 'Ethereum is a decentralized blockchain with smart contract functionality. Ether (Abbreviation: ETH;[a]) is the native cryptocurrency of the platform.', rate: 10 },
    ];

    constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

    async onModuleInit() {
        await this.seedCurrencies();
    }

    private async seedCurrencies() {
        
        for (let currencyData of this.currencies) {
            const existingCurrency = await this.currencyModel.findOne({ code: currencyData.code }).exec();

            if (!existingCurrency) {
                const newCurrency = new this.currencyModel(currencyData);
                await newCurrency.save();
            }
        }
        
        this.logger.log('Currency seeding populated with success!');
    }

}