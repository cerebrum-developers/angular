import { HotelMarkerTemplate } from './hotel-marker-template';

describe('HotelMarkerTemplate', () => {

    it('should get the template successfully', () => {
        const template = HotelMarkerTemplate.getTemplate('hi', 'text', '100', 'USD', { url: 'spctLogo.svg' });

        expect(template).toBeDefined();
    });

    it('should get the custom template for MRMS brand', () => {
        const template = HotelMarkerTemplate.getTemplate('ii', 'text', '100', 'USD', { url: 'spctLogo.svg' });
        expect(template).toContain('marker-container-item item-text');
    });

    it('should get the custom template for search without dates', () => {
        const template = HotelMarkerTemplate.getTemplate('ii', 'text', '100', 'USD', { url: 'spctLogo.svg' }, true);
        expect(template).not.toContain('marker-container-item item-text');
    });
});
