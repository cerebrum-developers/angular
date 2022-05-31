import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelOffer } from 'find-hotels/app/select-hotel-services/view-models/hotel-offer';
import { Brand } from 'ihg-brand-common-app-brand-constants';
import { of } from 'rxjs';
import { HotelOffersMapComponent } from './hotel-offers-map.component';
import { MAP_WRAPPER_TOKEN } from './map-wrapper-interface';
import { MapWrapper } from './map-wrapper';
import { HotelOffersFacadeService } from '../../../select-hotel-services/facades/hotel-offers-facade.service';
import { HotelOffersFacadeServiceMock } from '../../../select-hotel-services/facades/hotel-offers-facade-service-mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HotelMapFacadeService } from '../../../select-hotel-services/facades/hotel-map-facade.service';
import { HotelMapFacadeServiceMock } from '../../../select-hotel-services/facades/hotel-map-facade-service-mock';
import { ISearchCriteria } from '../../../shared/models/search-criteria';
import { ScrollToService } from 'find-hotels/app/shared/services/util/scroll-to.service';
import { CurrencyConversionService } from '../../../shared/services/api/currency-conversion/currency-conversion.service';
import { CurrencyConversionServiceMock } from '../../../shared/services/api/currency-conversion/currency-conversion-service-mock';
import { FilterByPriceType } from 'find-hotels/app/select-hotel-services/view-models/filter-by-price-type.enum';
import { HotelOfferSortFilterCriteria } from 'find-hotels/app/shared/models/hotel-offer-sort-filter-criteria';
import { BulkAvailabilitySearchCriteria } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability-search-criteria.model';
import { HotelOfferRulesService } from 'find-hotels/app/select-hotel-services/services/bi/services/hotel-offer-rules.service';
import { HotelOfferRulesServiceMock } from 'find-hotels/app/select-hotel-services/services/bi/services/hotel-offer-rules-service-mock';
import { CurrencyConversionFacadeService } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service';
import { CurrencyConversionFacadeServiceMock } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service.mock';
import { AppConfigService } from '@find-hotels-app/shared/services/config/app-config/app-config.service';
import { AppConfigServiceMock } from '@find-hotels-app/shared/services/config/app-config/app-config.service.mock';
import { FeatureToggleService } from '@find-hotels-app/shared/services/api/feature-toggle/feature-toggle.service';
import { FeatureToggleServiceMock } from '@find-hotels-app/shared/services/api/feature-toggle/feature-toggle-service-mock';
import { CeilPipe } from '@find-hotels-app/shared/pipes/ceil.pipe';
import { SearchFacadeService } from '../../../search-services/facades/search-facade.service';
import { SearchFacadeServiceMock } from '../../../search-services/facades/search-facade-service-mock';

describe('HotelOffersMapComponent', () => {
    let component: HotelOffersMapComponent;
    let fixture: ComponentFixture<HotelOffersMapComponent>;
    let mapWrapper;
    let scrollToService: ScrollToService;
    let hotelOfferRulesService: HotelOfferRulesService;

    const mockSearchCriteria = <ISearchCriteria>{
        destination: 'Atlanta',
        checkInDate: new Date('Thu Jun 27 2019'),
        checkOutDate: new Date('Fri Jun 28 2019'),
        numberOfAdults: 1,
        numberOfChildren: 0,
        numberOfRooms: 1,
        corporateId: '123456789',
        akamaiCountryCode: 'US',
        searchWithoutDates: false
    };

    const hotelOffers = [
        <HotelOffer>{
            hotelCode: 'ATLWS',
            latitude: 41.342700,
            longitude: -81.417590,
            lowestCashOnlyCostBeforeFeeTax: 100.10,
            rewardNightPointsOnlyPrice: 20000,
            rewardNightPointsCashPrice: 10000,
            hotelStatus: '',
            available: true,
            showCashPrice: true,
            showRewardNightWithPointsOnly: false,
            showRewardNightWithPointsCash: false,
            brand: Brand.HI
        }
    ];

    beforeEach((async () => {
        mapWrapper = new MapWrapper();
        const mapProp = {
            center: new google.maps.LatLng(51.508742, -0.120850),
            zoom: 5,
        };
        const el: HTMLElement = document.getElementById('content');
        mapWrapper.map = new google.maps.Map(el, mapProp);
        await TestBed.configureTestingModule({
            declarations: [HotelOffersMapComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                CeilPipe,
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                {
                    provide: MAP_WRAPPER_TOKEN,
                    useValue: mapWrapper
                },
                {
                    provide: HotelOffersFacadeService,
                    useClass: HotelOffersFacadeServiceMock
                },
                {
                    provide: HotelMapFacadeService,
                    useClass: HotelMapFacadeServiceMock
                },
                {
                    provide: ScrollToService,
                    useValue: { scrollTo: () => {
                        // do nothing
                        } }
                },
                {
                    provide: CurrencyConversionService,
                    useClass: CurrencyConversionServiceMock
                },
                {
                    provide: CurrencyConversionFacadeService,
                    useClass: CurrencyConversionFacadeServiceMock
                },
                {
                    provide: HotelOfferRulesService,
                    useClass: HotelOfferRulesServiceMock
                },
                {
                    provide: FeatureToggleService,
                    useClass: FeatureToggleServiceMock
                },
                {
                    provide: SearchFacadeService,
                    useClass: SearchFacadeServiceMock,
                }
            ]
        })
            .compileComponents().then(() => {
                scrollToService = TestBed.inject(ScrollToService);
                fixture = TestBed.createComponent(HotelOffersMapComponent);
                component = fixture.componentInstance;
                component.hotelOffers = hotelOffers;
                component.searchCriteria = mockSearchCriteria;
                hotelOfferRulesService = TestBed.inject(HotelOfferRulesService);
            });
    }));


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should read the state observer and create a Map', function () {
        const hotelOffer = <HotelOffer>{
            hotelCode: 'ATLWS',
            latitude: 41.342700,
            longitude: -81.417590,
            lowestCashOnlyCostBeforeFeeTax: 100.10,
            rewardNightPointsOnlyPrice: 20000,
            rewardNightPointsCashPrice: 10000,
            hotelStatus: '',
            available: true,
            showCashPrice: true,
            showRewardNightWithPointsOnly: false,
            showRewardNightWithPointsCash: false,
            brand: Brand.HI
        };

        const sortFilterCriteriaMock = <HotelOfferSortFilterCriteria>{
            priceType: FilterByPriceType.CASH,
        };
        const createMap = spyOn(mapWrapper, 'createMap');
        spyOn(hotelOfferRulesService, 'processOffer');
        const createCluster = spyOn(component, 'createMarkersAndClusters');

        component.hotelOffersFacadeService.sortFilterCriteria$ = of(<HotelOfferSortFilterCriteria>{ priceType: FilterByPriceType.CASH });
        component.currencyConversionFacadeService.currentCurrency$ = of('USD');
        component.hotelOffersMap = of({
            scriptModel: {
                loaded: true
            },
            hotelMapOptions: {
                defaultOptions: {},
                customOptions: {
                    iconTemplate: {
                        destinationPin: 'abc'
                    }
                }
            },
            mapLoaded: false
        });

        component.ngOnInit();
        expect(createMap).toHaveBeenCalled();
        expect(hotelOfferRulesService.processOffer).toHaveBeenCalledWith(hotelOffer, sortFilterCriteriaMock, mockSearchCriteria);
        expect(createCluster).toHaveBeenCalled();
        expect(component.mapWrapper.map).toBeDefined();
    });

    it('should read the state observer and no options are loaded then not to create a new Map', function () {

        component.hotelOffersMap = of({
            scriptModel: {
                loaded: false
            },
            mapLoaded: false,
            hotelMapOptions: {
                defaultOptions: {}
            }
        });
        component.isMapCreated = true;
        component.ngOnInit();

        expect(component.mapWrapper.map).toBeDefined();
    });

    it('should test zoom in functionality', function () {
        component.mapWrapper.map.getZoom = () => 5;
        component.mapWrapper.map.setZoom = () => {
            // do nothing
        };

        spyOn(component.hotelMapFacadeService, 'incrementZoomLevel');
        spyOn(component.mapWrapper.map, 'setZoom');
        component.zoomOut();
        expect(component.hotelMapFacadeService.incrementZoomLevel).toHaveBeenCalled();
        expect(component.mapWrapper.map.setZoom).toHaveBeenCalled();
    });

    it('should test zoom out functionality', function () {
        component.mapWrapper.map.getZoom = () => 5;
        component.mapWrapper.map.setZoom = () => {
            // do nothing
        };
        spyOn(component.hotelMapFacadeService, 'decrementZoomLevel');
        spyOn(component.mapWrapper.map, 'setZoom');
        component.zoomIn();
        expect(component.hotelMapFacadeService.decrementZoomLevel).toHaveBeenCalled();
        expect(component.mapWrapper.map.setZoom).toHaveBeenCalled();
    });

    it('should test on map loaded functionality', function () {
        spyOn(component.mapLoaded, 'emit');
        spyOn(component, 'addZoomControl');
        component.onMapLoaded();
        expect(component.mapLoaded.emit).toHaveBeenCalled();
        expect(component.addZoomControl).toHaveBeenCalled();
        expect(component.isMapCreated).toBeTruthy();
    });

    it('should test creating the html map marker element', function () {
        expect(component.htmlToElement('')).toBeDefined();
    });

    it('should test getting the position', function () {
        expect(component.getPosition('TOP_LEFT')).toBeUndefined();
        expect(component.getPosition('LEFT_CENTER')).toBeUndefined();
        expect(component.getPosition('FAKE')).toBeUndefined();
    });

    it('should test adding zoom controls', function () {
        spyOn(component, 'htmlToElement').and.returnValue(<HTMLDivElement>{});
        spyOn(component.controlEvents, 'push');
        const options = {
            zoomControlOptions: {
                position: '',
                controlTemplate: {
                    zoomControlTemplate: {
                        zoomIn: '',
                        zoomOut: ''
                    }
                }
            }
        };
        component.addZoomControl(options);
        expect(component.controlEvents.push).not.toHaveBeenCalled();
    });

    it('should not scroll when click on the marker', () => {
        spyOn(component, 'eventPath').and.returnValue([]);
        component.markerClicked = false;
        spyOn(scrollToService, 'scrollTo');
        component.onClickedOutside(<any>{});
        expect(scrollToService.scrollTo).not.toHaveBeenCalled();
    });

    it('should trigger cluster creation method once subscription is done', () => {
        spyOn(component, 'createClustersAfterDelay');
        component.createMarkersAndClusters();
        expect(component.createClustersAfterDelay).toHaveBeenCalled();
    });

    it('should trigger check street address', () => {
        spyOn(component, 'getAddress');
        const cityName = component.getAddress({
            lat: 41.342700,
            lng: -81.417590,
        });
        expect(cityName).not.toBeNull();
        expect(component.getAddress).toHaveBeenCalled();
    });

    it('should trigger when map drag', () => {
        spyOn(component.mapLoaded, 'emit');
        spyOn(component, 'addZoomControl');
        component.onMapLoaded();
        spyOn(component, 'onRedoSearch');
        component.redoSearchButton=true;
        component.onRedoSearch();
        expect(component.mapLoaded.emit).toHaveBeenCalled();
        expect(component.onRedoSearch).toHaveBeenCalled();
    });

    it('should gallery remain open on click outside', () => {
        spyOn(component, 'eventPath').and.returnValue([]);
        component.markerClicked = true;
        spyOn(scrollToService, 'scrollTo');
        component.isGalleryOpen = true;
        const event = <MouseEvent> {
            type: 'click',
            preventDefault: () => {},
            target: {}
        };
        component.onClickedOutside(event);
        expect(component.shouldDisplayHotelOffer).toBe(true);
    });

    describe('viewOfferAvailableDates()', () => {
        it('should emit when the button is clicked', function () {
            const mockBulkAvailabilitySearchCriteria = <BulkAvailabilitySearchCriteria>{
                hotelCode: 'xxx',
                returnAverages:true,
                rateCode: 'yyy'
            };

            spyOn(component, 'onViewAvailableDates');
            component.onViewAvailableDates(mockBulkAvailabilitySearchCriteria);
            expect(component.onViewAvailableDates).toHaveBeenCalled();
        });

    });
});
