import { InjectionToken } from '@angular/core';
import * as MarkerClusterer from '@google/markerclusterer';

export const MAP_WRAPPER_TOKEN = new InjectionToken('MapWrapperInterface');

export interface MapWrapperInterface {
    map: google.maps.Map;
    createMap(element: HTMLElement, mapProp: google.maps.MapOptions, pinSvg: string): void;
    createMarkerClusterer(markersList: any[], options: any): MarkerClusterer;
}
