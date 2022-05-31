import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotelOfferMapRedoSearchComponent } from './hotel-offer-map-redo-search.component';

describe('HotelOfferMapRedoSearchComponent', () => {
  let component: HotelOfferMapRedoSearchComponent;
  let fixture: ComponentFixture<HotelOfferMapRedoSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [HotelOfferMapRedoSearchComponent],
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelOfferMapRedoSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('redoSearchClick()', () => {
    it('should call redoSearchClick when redo search button click', () => {
        const goToSearchClick = spyOn(component.redoSearchClick, 'emit');
        component.onRedoSearchClick();
        expect(goToSearchClick).toHaveBeenCalled();
    });
  });

});
