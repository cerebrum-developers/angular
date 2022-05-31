import { HotelOffer } from '../../select-hotel-services/view-models/hotel-offer';
import { HotelMarkerTemplate } from './hotel-marker-template';
import { Subject } from 'rxjs';
import { ExchangeRate } from '../../shared/services/api/currency-conversion/currency-conversion.service';
import { CeilPipe } from '@find-hotels-app/shared/pipes/ceil.pipe';
import { FIND_HOTELS_MESSAGES } from '@find-hotels-app/messages';

const createHotelMapMarker = ({ OverlayView = google.maps.OverlayView, ...args }) => {
    class HotelMapMarker extends OverlayView {

        messages = FIND_HOTELS_MESSAGES;
        markerSubject = new Subject();

        private div: HTMLElement;
        private latlng: any;
        private hotelOffer: HotelOffer;
        private ceilPipe: CeilPipe;
        private searchWithoutDates: boolean;
        private showInclusivePrice: boolean;
        private cashConversion: ExchangeRate;

        constructor() {
            super();
            this.setMap(args.map);
            this.hotelOffer = args.hotelOffer;
            this.ceilPipe = args.ceilPipe;
            this.searchWithoutDates = args.searchWithoutDates;
            this.showInclusivePrice = args.showInclusivePrice;
            this.cashConversion = args.cashConversion;
            this.latlng = new google.maps.LatLng(this.hotelOffer.latitude, this.hotelOffer.longitude);
        }

        getPosition() {
            return this.latlng;
        }
        draw(): void {
            let div = this.div;
            let pinType = 'notAvail';
            let pinAmount = '';
            let pinLabel = 'cash';

            const originalCashPrice = this.showInclusivePrice ? this.hotelOffer.lowestCashOnlyCostAfterFeeTax : this.hotelOffer.lowestCashOnlyCostBeforeFeeTax;
            const cashPrice = this.ceilPipe.transform(originalCashPrice * this.cashConversion.rate);
            const rewardNightPointsOnlyPrice = this.ceilPipe.transform(this.hotelOffer.rewardNightPointsOnlyPrice);
            const rewardNightPointsCashPrice = this.ceilPipe.transform(this.hotelOffer.rewardNightPointsCashPrice);

            if (!div) {
                div = this.div = document.createElement('div');
                div.style.position = 'absolute';

                if(this.hotelOffer.freeNight.isFlexChaseAvailable) {
                    pinLabel = `${this.messages.msgChaseAnniversaryNight} +${this.hotelOffer.freeNight.lowestFlexChaseOption.pointAmount} ${this.messages.msgPoints2}`;
                } else if (this.hotelOffer.freeNight.isChaseAvailable) {
                    pinLabel = `${this.messages.msgChaseAnniversaryNight} ${this.messages.msgFreeText}`;
                } else if (this.hotelOffer.freeNight.isAvailable) {
                    pinLabel = this.messages.msgFreeText;
                } else if (this.hotelOffer.hotelStatus === 'Opening Soon') {
                    pinLabel = `${this.messages.msgOpeningSoon}`;
                } else if (!this.hotelOffer.available) {
                    pinLabel = `${this.messages.msgNoRoomAvailable}`;
                } else if (this.hotelOffer.showCashPrice) {
                    pinType = 'typeText';
                    pinAmount = `${cashPrice}`;
                    pinLabel = `${this.cashConversion.to}`;
                } else if (this.hotelOffer.showRewardNightWithPointsOnly) {
                    pinType = 'typeText';
                    pinLabel = this.messages.msgPoints2;
                    pinAmount = `${rewardNightPointsOnlyPrice}`;
                } else if (this.hotelOffer.showRewardNightWithPointsCash) {
                    pinType = 'typeText';
                    pinLabel = this.messages.msgPtsCash;
                    pinAmount = `${rewardNightPointsCashPrice}`;
                }

                div.insertAdjacentHTML('beforeend', HotelMarkerTemplate.getTemplate(
                    this.hotelOffer.brand.brandCode.toLowerCase(),
                    pinType,
                    pinAmount,
                    pinLabel,
                    this.hotelOffer.webNonBrandedHotelLogo,
                    this.searchWithoutDates
                ));

                div.onclick = () => {
                    for (let i = 0; i < document.querySelectorAll('.marker-container').length; i++) {
                        document.querySelectorAll('.marker-container')[i].classList.remove('marker-container-clicked');
                    }
                    div.querySelector('.marker-container').classList.add('marker-container-clicked');
                    this.markerSubject.next(this.hotelOffer);
                };

                const panes = this.getPanes();
                panes['overlayImage'].appendChild(div);
            }

            const point = this.getProjection().fromLatLngToDivPixel(this.latlng);

            if (point) {
                div.style.left = (point.x - 10) + 'px';
                div.style.top = (point.y - 20) + 'px';
            }
        }

        onRemove() {
            if (!!this.div && !!this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        }
    }
    return new HotelMapMarker();
};

export default createHotelMapMarker;
