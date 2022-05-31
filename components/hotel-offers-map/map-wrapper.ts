import * as MarkerClusterer from '@google/markerclusterer';
import { MapWrapperInterface } from './map-wrapper-interface';
import { Injectable } from '@angular/core';

@Injectable()
export class MapWrapper implements MapWrapperInterface {

    map: google.maps.Map;
    destinationMarker: google.maps.Marker;

    public createMap(element: HTMLElement, mapProp: google.maps.MapOptions, pinSvg: string): void {
        this.createGoogleMap(element, mapProp);
        this.setCityCenter(mapProp, pinSvg);
    }

    public createMarkerClusterer(markersList: any[], options: any): MarkerClusterer {
        return new MarkerClusterer(this.map, markersList, options);
    }

    private setCityCenter(mapProp: google.maps.MapOptions, pinSvg: string) {
        const icon = <google.maps.Icon>{};
        icon.url = pinSvg;
        icon.scaledSize = new google.maps.Size(30, 30);
        this.destinationMarker = new google.maps.Marker({ map: this.map, icon: icon, position: mapProp.center });
    }

    private createGoogleMap(element: HTMLElement, mapProp: google.maps.MapOptions): void {
        this.map = new google.maps.Map(element, mapProp);
    }
}
