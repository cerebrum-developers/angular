import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, Subscription } from 'rxjs';
import { HotelOffer } from '../../../select-hotel-services/view-models/hotel-offer';
import createHotelMapMarker from '../../utils/hotel-map-marker';
import { MAP_CONSTANTS, MAP_INTERACTIONS, MAP_POSITIONS } from '../../hotel-map.constants';
import { CLUSTER_SVG, COLOR_MAP } from '../../../select-hotel-services/services/api/google-maps-api/hotel-map-options.service.constants';
import * as MarkerClusterer from '@google/markerclusterer';
import { MAP_WRAPPER_TOKEN, MapWrapperInterface } from './map-wrapper-interface';
import { HotelOffersFacadeService } from '../../../select-hotel-services/facades/hotel-offers-facade.service';
import { HotelMapFacadeService } from '../../../select-hotel-services/facades/hotel-map-facade.service';
import { RadiusUnit } from '../../../shared/models/radius-unit.enum';
import { ISearchCriteria } from '../../../shared/models/search-criteria';
import { ZOOM_LEVEL_BETWEEN_10_AND_25, ZOOM_LEVEL_BETWEEN_50_AND_75, ZOOM_LEVEL_BETWEEN_5_AND_10, ZOOM_LEVEL_BETWEEN_75_AND_100, ZOOM_LEVEL_FOR_LARGE_RADIUS } from './hotel-offers-map.messages';
import { CurrencyConversionService, ExchangeRate } from '../../../shared/services/api/currency-conversion/currency-conversion.service';
import { catchError, map } from 'rxjs/operators';
import { FilterByPriceType } from 'find-hotels/app/select-hotel-services/view-models/filter-by-price-type.enum';
import { BulkAvailabilitySearchCriteria } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability-search-criteria.model';
import { HotelOfferComponent } from 'find-hotels/app/hotel-offer/components/hotel-offer/hotel-offer.component';
import { BulkAvailability } from 'find-hotels/app/select-hotel-services/services/api/bulk-availability/models/bulk-availability.model';
import { CurrencyConversionFacadeService } from '../../../shared/services/api/currency-conversion/facades/currency-conversion-facade.service';
import { HotelOfferRulesService } from 'find-hotels/app/select-hotel-services/services/bi/services/hotel-offer-rules.service';
import _map from 'lodash-es/map';
import { AppConfigService } from '@find-hotels-app/shared/services/config/app-config/app-config.service';
import { CeilPipe } from '@find-hotels-app/shared/pipes/ceil.pipe';
import { SearchFacadeService } from '../../../search-services/facades/search-facade.service';
@Component({
    selector: 'hotel-offers-map',
    templateUrl: './hotel-offers-map.component.html',
    styleUrls: ['./hotel-offers-map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HotelOffersMapComponent implements OnInit, OnDestroy {

    @ViewChild('gmap', { static: true })
    gmapElement: any;

    @Input()
    hotelOffersMap: Observable<any>;

    @Input()
    hotelOffers: HotelOffer[];

    @Output()
    mapLoaded: EventEmitter<any>;

    @Output()
    zoomIncremented: EventEmitter<any>;

    @Output()
    zoomDecremented: EventEmitter<any>;

    @Output()
    markerClick: EventEmitter<HotelOffer> = new EventEmitter<HotelOffer>();

    @Input()
    viewPort: string;

    @Input()
    searchCriteria: ISearchCriteria;

    @Input()
    showInclusivePrices = false;

    @Input()
    selectedCurrency: string;

    @Input()
    bulkAvailabilityError: boolean;

    @Output()
    bulkAvailabilityViewed: EventEmitter<BulkAvailabilitySearchCriteria>;

    @Input()
    bulkAvailabilityMap: Map<string, BulkAvailability>;

    @ViewChild('scrollMapId', { static: true }) scrollMapId: any;
    @ViewChild(HotelOfferComponent) private hotelOfferComponent: HotelOfferComponent;

    controlEvents: any;
    defaultMapOptions: any;
    isMapCreated: boolean;
    idleListener: google.maps.MapsEventListener;
    dragListener: google.maps.MapsEventListener;
    markersList = [];
    markerClusterer: MarkerClusterer;
    mnemonicList: string[];
    isGalleryOpen: boolean;
    hotelOffer: HotelOffer;
    shouldDisplayHotelOffer = false;
    markerClicked = false;
    priceType: FilterByPriceType;
    calClickedEvent = false;
    filterValue$: Observable<any>;
    redoSearchButton = false;
    private _subcriptions: Subscription[] = [];

    getMapClass(): {[index:string]: boolean} {
        return { 'map-component': true }
    }

    constructor(private ceilPipe: CeilPipe, private appConfigService: AppConfigService,
        @Inject(MAP_WRAPPER_TOKEN) public mapWrapper: MapWrapperInterface,
        public hotelOffersFacadeService: HotelOffersFacadeService,
        public hotelMapFacadeService: HotelMapFacadeService,
        private currencyConversionService: CurrencyConversionService,
        public currencyConversionFacadeService: CurrencyConversionFacadeService,
        private hotelOfferRulesService: HotelOfferRulesService,
        public searchFacadeService: SearchFacadeService
    ) {
        this.mapLoaded = new EventEmitter();
        this.zoomIncremented = new EventEmitter();
        this.zoomDecremented = new EventEmitter();
        this.controlEvents = [];
        this.defaultMapOptions = {};
        this.isMapCreated = false;
        this.isGalleryOpen = false;
        this.bulkAvailabilityViewed = new EventEmitter<BulkAvailabilitySearchCriteria>();
    }

    overrideGoogleMapOptions(options: google.maps.MapOptions): google.maps.MapOptions {
        return { ...options, scrollwheel: false, disableDoubleClickZoom: true, gestureHandling: 'none', draggableCursor: 'pointer', draggingCursor: 'pointer', draggable: false };
    }

    ngOnInit() {
        if (this.hotelOffersMap) {
            this.hotelOffersMap.subscribe(hotelOffersMap => {
                if (!!hotelOffersMap && !!hotelOffersMap.scriptModel) {
                    if (hotelOffersMap.scriptModel.loaded) {
                        if (hotelOffersMap.hotelMapOptions) {
                            if (!this.isMapCreated) {
                                const options: google.maps.MapOptions = { ...hotelOffersMap.hotelMapOptions.defaultOptions };
                                this.defaultMapOptions = options;
                                const destinationPin = hotelOffersMap.hotelMapOptions.customOptions.iconTemplate.destinationPin;
                                this.mapWrapper.createMap(this.gmapElement.nativeElement, options, destinationPin);
                                this.filterValue$ = combineLatest(this.hotelOffersFacadeService.sortFilterCriteria$, this.currencyConversionFacadeService.currentCurrency$);
                                this._subcriptions.push(this.filterValue$.subscribe(([sortFilterCriteria, currentCurrency]) => {
                                    if (this.priceType !== sortFilterCriteria.priceType || this.selectedCurrency !== currentCurrency) {
                                        this.priceType = sortFilterCriteria.priceType;
                                        this.selectedCurrency = currentCurrency;
                                        this.hotelOffers.map(hotelOffer => this.hotelOfferRulesService.processOffer(hotelOffer, sortFilterCriteria, this.searchCriteria));
                                        this.createMarkersAndClusters();
                                    }
                                }));

                                // Event fired when the map is fully loaded
                                this.idleListener = google.maps.event.addListenerOnce(this.mapWrapper.map, 'idle', () => {
                                    this.onMapLoaded();
                                });
                                this.dragListener = google.maps.event.addListenerOnce(this.mapWrapper.map, 'drag', () => {
                                    this.redoButtonEnable();
                                });
                            } else {
                                if (!!this.mapWrapper.map && (typeof this.mapWrapper.map.setZoom === 'function') && !!hotelOffersMap &&
                                    !!hotelOffersMap.hotelMapOptions && !!hotelOffersMap.hotelMapOptions.defaultOptions &&
                                    (typeof hotelOffersMap.hotelMapOptions.defaultOptions.zoom === 'number')) {
                                    // This if block is triggered when the map model changes but the map has already been once created and just needs updating.
                                    this._subcriptions.push(this.hotelOffersFacadeService.sortFilterCriteria$.subscribe(sortFilterCriteria => {
                                        if (sortFilterCriteria.radius >= 5 && sortFilterCriteria.radius < 10) {
                                            this.mapWrapper.map.setZoom(ZOOM_LEVEL_BETWEEN_5_AND_10);
                                        } else if (sortFilterCriteria.radius >= 10 && sortFilterCriteria.radius < 25) {
                                            this.mapWrapper.map.setZoom(ZOOM_LEVEL_BETWEEN_10_AND_25);
                                        } else if (sortFilterCriteria.radius > 50 && sortFilterCriteria.radius <= 75) {
                                            this.mapWrapper.map.setZoom(ZOOM_LEVEL_BETWEEN_50_AND_75);
                                        } else if (sortFilterCriteria.radius > 75 && sortFilterCriteria.radius <= 100) {
                                            this.mapWrapper.map.setZoom(ZOOM_LEVEL_BETWEEN_75_AND_100);
                                        } else if (sortFilterCriteria.radius > 100 && sortFilterCriteria.radiusUnit === RadiusUnit.KM) {
                                            this.mapWrapper.map.setZoom(ZOOM_LEVEL_FOR_LARGE_RADIUS);
                                        } else {
                                            this.mapWrapper.map.setZoom(hotelOffersMap.hotelMapOptions.defaultOptions.zoom);
                                        }
                                    }));
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    onMapLoaded() {
        this.isMapCreated = true;
        this.mapLoaded.emit();
        this.addZoomControl(this.defaultMapOptions);
        if (!!google && !!google.maps && !!google.maps.event && typeof google?.maps?.event?.removeListener === "function") {
            google.maps.event.removeListener(this.idleListener);
        }
    }

    redoButtonEnable():void {
        this.redoSearchButton=true;
        if (!!google && !!google.maps && !!google.maps.event && typeof google?.maps?.event?.removeListener === "function") {
            google.maps.event.removeListener(this.dragListener);
        }
    }

    getAddress = (latlng:{lat:number,lng:number}):Promise<string> => {
        const geocoder = new google.maps.Geocoder;
        const latlongPromise =  new Promise<string>((resolve) => {
            geocoder.geocode({
                'location': latlng
            }, results => {
                if(results.length > 0) {
                    let itemLocality: string;
                    let itemRegion: string;
                    let itemCountry: string;
                    results[0].address_components.forEach( (element) => {
                        // City
                        if (element.types[0] === "locality"){
                            itemLocality = element.long_name;
                        }
                        // State or region
                        if (element.types[0] === "administrative_area_level_1") {
                            itemRegion = element.long_name;
                        }
                        // Country
                        if (element.types[0] === "country"){
                            itemCountry = element.long_name;
                        }
                    });
                    if (itemLocality != null || itemRegion != null || itemCountry != null) {
                        const tempAddress: string[] = [];
                        if (itemLocality !== null) {
                            tempAddress.push(itemLocality);
                        }
                        if (itemRegion !== null) {
                            tempAddress.push(itemRegion);
                        }
                        if (itemCountry !== null) {
                            tempAddress.push(itemCountry);
                        }
                        resolve(tempAddress.join(", "));
                    } else {
                        resolve(results[0].formatted_address);
                    }
                }
            });
        });
        return latlongPromise;
    }

    onRedoSearch = ():void => {
        const lat = this.mapWrapper.map.getCenter().lat();
        const long = this.mapWrapper.map.getCenter().lng();
        const latlng = {
            lat: lat, lng: long
        };
        this._subcriptions.push(this.searchFacadeService.searchCriteria$
            .subscribe((searchCriteria: ISearchCriteria) => {
                this.getAddress(latlng).then(result => {
                    searchCriteria.destination = result;
                    searchCriteria.latitude = lat;
                    searchCriteria.longitude = long;
                    this.searchFacadeService.submitSearch(searchCriteria);
                });
            }));
    }

    zoomOut = () => {
        const currentZoomLevel = this.mapWrapper.map.getZoom();
        if (currentZoomLevel > MAP_CONSTANTS.MAX_ZOOM && !!currentZoomLevel) {
            this.hotelMapFacadeService.incrementZoomLevel(currentZoomLevel);
            this.mapWrapper.map.setZoom(currentZoomLevel - 1);
        }
    };

    zoomIn = () => {
        const currentZoomLevel = this.mapWrapper.map.getZoom();
        if (currentZoomLevel < MAP_CONSTANTS.MIN_ZOOM && !!currentZoomLevel) {
            this.hotelMapFacadeService.decrementZoomLevel(currentZoomLevel);
            this.mapWrapper.map.setZoom(currentZoomLevel + 1);
        }
    };

    htmlToElement = (html) => {
        const element = document.createElement('div');
        element.innerHTML = html;
        return (element);
    };

    getPosition = function (location) {
        if (location === MAP_POSITIONS.TOP_LEFT) {
            return google.maps.ControlPosition.TOP_LEFT;
        } else if (location === MAP_POSITIONS.LEFT_CENTER) {
            return google.maps.ControlPosition.LEFT_CENTER;
        } else {
            return google.maps.ControlPosition.TOP_LEFT;
        }
    };

    addZoomControl = (options) => {
        const zoomControlNode = this.htmlToElement(options.zoomControlOptions.controlTemplate.zoomControlTemplate.zoomIn +
            options.zoomControlOptions.controlTemplate.zoomControlTemplate.zoomOut);

        _map(zoomControlNode.childNodes, (element) => {
            if (element['id'] === MAP_INTERACTIONS.ZOOM_OUT) {
                element.addEventListener('click', this.zoomOut);
                this.controlEvents.push(element);
            } else if (element['id'] === MAP_INTERACTIONS.ZOOM_IN) {
                element.addEventListener('click', this.zoomIn);
                this.controlEvents.push(element);
            }
        });

        if (!!this.mapWrapper.map && !!this.mapWrapper.map.controls && this.mapWrapper.map.controls[this.getPosition(options.zoomControlOptions.position)]) {
            this.mapWrapper.map.controls[this.getPosition(options.zoomControlOptions.position)].push(zoomControlNode);
        }
    };

    createMap(element: HTMLElement, mapProp: google.maps.MapOptions): google.maps.Map {
        return new google.maps.Map(element, mapProp);
    }

    createMarkersAndClusters(): void {
        this.mnemonicList = [];
        this.markersList.forEach(marker => {
            if (marker) {
                marker.setMap(null);
            }
        });
        this.markersList = [];
        if (this.markerClusterer) {
            this.markerClusterer.clearMarkers();
        }

        const observables = this.hotelOffers.map(hotelOffer => this.convert(hotelOffer.currencyCode, this.selectedCurrency)
            .pipe(map(result => {
                const cashConversion: ExchangeRate = result[0];
                this.mnemonicList.push(hotelOffer.hotelCode);
                const marker = createHotelMapMarker({
                    hotelOffer: hotelOffer,
                    searchWithoutDates: this.searchCriteria.searchWithoutDates || false,
                    ceilPipe: this.ceilPipe,
                    showInclusivePrice: this.showInclusivePrices,
                    cashConversion: cashConversion
                });
                marker.markerSubject.subscribe((_hotelOffer: HotelOffer) => {
                    this.hotelOffer = _hotelOffer;
                    this.shouldDisplayHotelOffer = true;
                    this.markerClicked = true;
                });
                this.markersList.push(marker);
            })));

        const source = forkJoin(observables);

        this._subcriptions.push(source.subscribe(() => {
            this.createClustersAfterDelay();
        }));
    }


    convert(from: string, to: string): Observable<[ExchangeRate, ExchangeRate]> {
        if (!to) {
            to = from;
        }
        return this.currencyConversionService.getHotelConversionRates(from, to).pipe(
            catchError(() => {
                const dollar = 'USD';
                const cashExchange: ExchangeRate = { from: from, to: from, rate: 1 };
                const pointsExchange: ExchangeRate = { from: dollar, to: dollar, rate: 1 };
                const response: [ExchangeRate, ExchangeRate] = [cashExchange, pointsExchange];
                return of(response);
            })
        );
    }

    createClustersAfterDelay() {
        setTimeout(() => this.createMarkerClusterer(), 1000);
    }

    createURL(fill) {
        return ('data:image/svg+xml;base64,' + window.btoa(CLUSTER_SVG.replace('@fill', fill)));
    }

    onSelected($event) {
        this.hotelOffersFacadeService.selectHotelOffer($event);
    }

    toggleGallery($event) {
        this.isGalleryOpen = $event;
    }

    eventPath(evt) {
        const path = (evt.composedPath && evt.composedPath()) || evt.path;
        const target = evt.target;
        if (path != null) {
            return (path.indexOf(window) < 0) ? path.concat(window) : path;
        }
        if (target === window) {
            return [window];
        }
        function getParents(node, memo) {
            memo = memo || [];
            const parentNode = node.parentNode;
            if (!parentNode) {
                return memo;
            } else {
                return getParents(parentNode, memo.concat(parentNode));
            }
        }
        return [target].concat(getParents(target, null), window);
    }


    onClickedOutside(event: Event) {
        if (this.eventPath(event).some(element => {
            const htmlElement = element as HTMLElement;
            return htmlElement.id === 'detailsToggle' || htmlElement.id === 'thumbnail';
        })) {
            return;
        }

        if (this.markerClicked && !!document && document.getElementsByClassName('bulkAvailContainerMap').length > 0) {
            this.hotelOfferComponent.showAvailabilityCalendar(false);
        }
        if (!this.markerClicked && !this.calClickedEvent && !this.isGalleryOpen) {
            this.shouldDisplayHotelOffer = false;
            for (let i = 0; i < document.querySelectorAll('.marker-container').length; i++) {
                document.querySelectorAll('.marker-container')[i].classList.remove('marker-container-clicked');
            }
        } else {
            this.shouldDisplayHotelOffer = true;
            this.markerClicked = false;
            this.calClickedEvent = false;
        }
    }

    createMarkerClusterer(): void {
        const sizes = [53, 56, 66, 78, 90];
        const styles = [];
        sizes.forEach(size => {
            styles.push({
                url: this.createURL(COLOR_MAP[this.appConfigService.brandCode.toLowerCase()]),
                height: size,
                width: size,
                textColor: 'White'
            });
        });
        const list = this.mnemonicList.join('-');
        this.markerClusterer = this.mapWrapper.createMarkerClusterer(this.markersList,
            { minimumClusterSize: 2, maxZoom: 18, styles: styles, addMetaToClusterPin: list });
    }

    onViewAvailableDates(searchCriteria: BulkAvailabilitySearchCriteria) {
        this.calClickedEvent = true;
        this.hotelOffersFacadeService.searchBulkAvailability(searchCriteria);
    }

    ngOnDestroy(): void {
        this._subcriptions.map(s => s.unsubscribe());
    }
}
