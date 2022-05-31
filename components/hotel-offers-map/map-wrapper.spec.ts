import { MapWrapper } from './map-wrapper';

describe('MapWrapper', () => {
    const mapProp = {
        center: new google.maps.LatLng(51.508742, -0.120850),
        icon: 'image',
    } as google.maps.MapOptions;

    const mapWrapper = new MapWrapper();
    const el: HTMLElement = document.getElementById('content');

    it('should call the city center pin and get center,icon and size', () => {
        mapWrapper.createMap(el, mapProp, 'abc');
        expect(mapWrapper.map['center']).toEqual(mapWrapper.destinationMarker.getPosition);
        expect(mapWrapper.map['icon']).toEqual(mapWrapper.destinationMarker.getIcon);
        expect(mapWrapper.map['scaledSize']).toEqual(mapWrapper.destinationMarker['getSize']);
    });
});
