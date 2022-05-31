// / <reference types="@types/googlemaps" />
import { Component, Input, OnInit, ChangeDetectionStrategy, EventEmitter, Output, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HotelMapFacadeService } from '../../../select-hotel-services/facades/hotel-map-facade.service';
import { HotelOffer } from '../../../select-hotel-services/view-models/hotel-offer';
import { ISearchCriteria } from '../../../shared/models/search-criteria';
import { SearchFacadeService } from '../../../search-services/facades/search-facade.service';
import { CurrencyConversionFacadeService } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service';
import { BulkAvailability } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability.model';
import { BulkAvailabilitySearchCriteria } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability-search-criteria.model';
import { HotelOffersMapState } from '@find-hotels-app/select-hotel-services/reducers/hotel-offers-map-state';

@Component({
    selector: 'hotel-offers-map-view',
    templateUrl: './hotel-offers-map-view.component.html',
    styleUrls: ['./hotel-offers-map-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelOffersMapViewComponent implements OnInit {


    @Input()
    listViewEnabled: boolean;

    @Input()
    hotelOffers$: Observable<HotelOffer[]>;

    @Input()
    viewPort: string;

    @Input()
    searchCriteria: ISearchCriteria;

    @Input()
    bulkAvailabilityMap: Map<string, BulkAvailability>;

    @Input()
    bulkAvailabilityError: boolean;

    @Output()
    bulkAvailabilityViewed: EventEmitter<BulkAvailabilitySearchCriteria>;

    @Output()
    mapLoadedEvent = new EventEmitter<ElementRef>();

    hotelOffersMap$: Observable<HotelOffersMapState>;

    bulkAvailabilitySearchCriteria: BulkAvailabilitySearchCriteria;

    constructor(public hotelMapFacadeService: HotelMapFacadeService, public searchFacadeService: SearchFacadeService,
        public currencyConversionFacadeService: CurrencyConversionFacadeService) {
        this.bulkAvailabilityViewed = new EventEmitter<BulkAvailabilitySearchCriteria>();
    }

    ngOnInit(): void {
        this.hotelOffersMap$ = this.hotelMapFacadeService.hotelsOffersMap$;
    }

    onMapLoaded() {
        this.hotelMapFacadeService.updateMapLoadedStatus();
        this.mapLoadedEvent.emit();
    }

    onViewOfferAvailableDates(searchCriteria: BulkAvailabilitySearchCriteria) {
        this.bulkAvailabilitySearchCriteria = searchCriteria;
        this.bulkAvailabilityViewed.emit(searchCriteria);
    }
}

