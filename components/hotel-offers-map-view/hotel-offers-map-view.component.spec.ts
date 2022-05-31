import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotelOffersMapViewComponent } from './hotel-offers-map-view.component';
import { HotelMapFacadeService } from '../../../select-hotel-services/facades/hotel-map-facade.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HotelMapFacadeServiceMock } from '../../../select-hotel-services/facades/hotel-map-facade-service-mock';
import { SearchFacadeService } from '../../../search-services/facades/search-facade.service';
import { SearchFacadeServiceMock } from '../../../search-services/facades/search-facade-service-mock';
import { CurrencyConversionFacadeService } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service';
import { CurrencyConversionFacadeServiceMock } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service.mock';
import { BulkAvailabilitySearchCriteria } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability-search-criteria.model';


describe('HotelOffersMapViewComponent', () => {
    let component: HotelOffersMapViewComponent;
    let fixture: ComponentFixture<HotelOffersMapViewComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HotelOffersMapViewComponent],
            providers: [
                { provide: HotelMapFacadeService, useClass: HotelMapFacadeServiceMock },
                { provide: SearchFacadeService, useClass: SearchFacadeServiceMock },
                { provide: CurrencyConversionFacadeService, useClass: CurrencyConversionFacadeServiceMock },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HotelOffersMapViewComponent);
        component = fixture.componentInstance;

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test map load', () => {
        spyOn(component.hotelMapFacadeService, 'updateMapLoadedStatus');
        component.onMapLoaded();
        expect(component.hotelMapFacadeService.updateMapLoadedStatus).toHaveBeenCalled();
    });
    describe('onMapLoaded()', () => {
        it('should emit the value on map loaded', () => {
            const loadMapClick = spyOn(component.mapLoadedEvent, 'emit');
            spyOn(component.hotelMapFacadeService, 'updateMapLoadedStatus');
            component.onMapLoaded();
            expect(loadMapClick).toHaveBeenCalled();
        })
    });

    describe('viewOfferAvailableDates()', () => {
        it('should emit when the button is clicked', function () {
            const mockBulkAvailabilitySearchCriteria = <BulkAvailabilitySearchCriteria> {
                hotelCode: 'xxx',
                returnAverages: true,
                rateCode: 'yyy'
            };

            spyOn(component, 'onViewOfferAvailableDates');
            component.onViewOfferAvailableDates(mockBulkAvailabilitySearchCriteria);
            expect(component.onViewOfferAvailableDates).toHaveBeenCalled();
        });

    });
});
