import { Component, EventEmitter, Output, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FIND_HOTELS_MESSAGES } from '@find-hotels-app/messages';

@Component({
  selector: 'hotel-offer-map-redo-search',
  templateUrl: './hotel-offer-map-redo-search.component.html',
  styleUrls: ['./hotel-offer-map-redo-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HotelOfferMapRedoSearchComponent {

  @Output() redoSearchClick = new EventEmitter();

  messages = FIND_HOTELS_MESSAGES;

  onRedoSearchClick():void {
    this.redoSearchClick.emit();
  }
}
