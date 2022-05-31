import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'hotel-offers-map-skeleton',
    templateUrl: './hotel-offers-map-skeleton.component.html',
    styleUrls: ['./hotel-offers-map-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class HotelOffersMapSkeletonComponent {

    @Input()
    listViewEnabled: boolean;
}
