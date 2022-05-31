import { Brand } from 'ihg-brand-common-app-brand-constants';
export class HotelMarkerTemplate {

    private static TEMPLATE = `<div class="map-marker">
      <div class="marker-container marker-border--{brand}">
      <div class="marker-container-item item-image">
      <img src="/cdn/vendor/ihg-brand-svg/v1.4.5/svg/brand-logos/round/{brand}.svg" width="30px" height="30px" alt="">
     </div>
         <div class="marker-container-item item-text">
            <span class="amount"><strong>{amount}</strong></span>
            <span class="{class}">{label}</span>
         </div>
      </div>
      <div class="arrow--{brand}"></div>
   </div>`;
    private static CUSTOM_SX_TEMPLATE = `<div class="map-marker">
      <div class="marker-container marker-border--{brand}">
      <div class="marker-container-item item-image">
      <img src="/cdn/vendor/ihg-brand-svg/v1.4.5/svg/brand-logos/round/{brand}.svg" width="30px" height="30px" alt="">
     </div>
         <div class="marker-container-item item-text">
            <span class="amount"><strong>{amount}</strong></span>
            <span class="{class}">{label}</span>
         </div>
      </div>
      <div class="arrow--{brand}"></div>
   </div>`;

    private static CUSTOM_SPCT_TEMPLATE = `<div class="map-marker">
      <div class="marker-container marker-border--{brand}">
         <div class="marker-container-item item-image">
            <img src="{spctLogoUrl}" width="30px" height="30px" alt="">
         </div>
      </div>
      <div class="arrow--{brand}"></div>
   </div>`;

    private static CUSTOM_ND_TEMPLATE = `<div class="map-marker">
      <div class="marker-container marker-border--{brand}">
         <div class="marker-container-item item-text">
            <span class="amount"><strong>{amount}</strong></span>
            <span class="{class}">{label}</span>
         </div>
      </div>
   </div>`;

    private static CUSTOM_SEARCH_WITHOUT_DATES_TEMPLATE = `<div class="map-marker">
   <div class="marker-container marker-border--{brand}">
      <div class="marker-container-item item-image">
         <img src="/cdn/vendor/ihg-brand-svg/v1.4.5/svg/brand-logos/round/{brand}.svg" width="30px" height="30px" alt="">
      </div>
   </div>
   <div class="arrow--{brand}"></div>
</div>`;

    static getTemplate(
        brandCode: string,
        pinType: any,
        amount: string,
        pinLabel: string,
        webNonBrandedHotelLogo,
        searchWithoutDates?: boolean
    ) {

        if (searchWithoutDates) {
            return this.CUSTOM_SEARCH_WITHOUT_DATES_TEMPLATE.replace(/{brand}/g, brandCode);
        } else if (brandCode === 'nd') {
            return this.CUSTOM_ND_TEMPLATE.replace(/{brand}/g, brandCode)
                .replace(/{class}/g, pinType)
                .replace(/{amount}/g, amount)
                .replace(/{label}/g, pinLabel);
        } else if (brandCode === Brand.SPCT.brandCode) {
            return this.CUSTOM_SPCT_TEMPLATE.replace(/{brand}/g, brandCode)
                .replace(/{class}/g, pinType)
                .replace(/{amount}/g, amount)
                .replace(/{label}/g, pinLabel)
                .replace(/{spctLogoUrl}/g, webNonBrandedHotelLogo);
        } else if (brandCode === 'sx'){
            return this.CUSTOM_SX_TEMPLATE.replace(/{brand}/g, brandCode + '_map')
                .replace(/{class}/g, pinType)
                .replace(/{amount}/g, amount)
                .replace(/{label}/g, pinLabel);
        }else {
            return this.TEMPLATE.replace(/{brand}/g, brandCode)
                .replace(/{class}/g, pinType)
                .replace(/{amount}/g, amount)
                .replace(/{label}/g, pinLabel);
        }
    }
}
