import { Brand } from 'ihg-brand-common-app-brand-constants';
import { HotelOffer } from '../../select-hotel-services/view-models/hotel-offer';
import createHotelMapMarker from './hotel-map-marker';
import { ExchangeRate } from '../../shared/services/api/currency-conversion/currency-conversion.service';
import { CeilPipe } from '@find-hotels-app/shared/pipes/ceil.pipe';

describe('createHotelMapMarker', () => {
    const cashConversion: ExchangeRate = { from: 'MXN', to: 'USD', rate: 0.5 };

    const hotelOfferMock = <HotelOffer>{
        latitude: 1,
        longitude: 1,
        lowestCashOnlyCostBeforeFeeTax: 100.00,
        lowestCashOnlyCostAfterFeeTax: 150.00,
        rewardNightPointsOnlyPrice: 20000,
        rewardNightPointsCashPrice: 10000,
        hotelStatus: '',
        available: true,
        showCashPrice: true,
        showRewardNightWithPointsOnly: false,
        showRewardNightWithPointsCash: false,
        brand: Brand.HI
    };
    const ceilPipeMock = {};
    it('should create a new instance of HotelMapMarker', () => {
        const markerObject = createHotelMapMarker({ hotelOffer: hotelOfferMock, cashConversion, showInclusivePrice: true,
            searchWithoutDates: true, map: null, ceilPipe: ceilPipeMock as CeilPipe });
        expect(markerObject).toBeDefined();
    });
});
