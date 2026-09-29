const cds = require('@sap/cds');
 
module.exports = class LogisticsService extends cds.ApplicationService {
    async init() {
        const { Shipments, Packages } = this.entities;
 
        // Multiplier rates by TransportMode
        const rates = {
            'Air': 15,
            'Sea': 5,
            'Rail': 8
        };
 
        this.after('READ', Shipments, async (eachShipment, req) => {
            if (!eachShipment) return;
 
            // Normalize single vs array result handling
            const shipments = Array.isArray(eachShipment) ? eachShipment : [eachShipment];
 
            for (const shipment of shipments) {
                let packagesList = shipment.packages;
 
                // Handle cases where packages might not be expanded in the initial request
                if (!packagesList || packagesList.length === 0) {
                    packagesList = await cds.tx(req).run(
                        SELECT.from(Packages).where({ parent_ID: shipment.ID })
                    );
                }
 
                // Calculate totalWeight
                const totalWeight = (packagesList || []).reduce((sum, pkg) => {
                    return sum + (Number(pkg.weight) || 0);
                }, 0);
 
                // Calculate shippingFee
                const multiplier = rates[shipment.mode] || 0;
                const shippingFee = totalWeight * multiplier;
 
                // Set virtual fields
                shipment.totalWeight = totalWeight;
                shipment.shippingFee = shippingFee;
            }
        });
 
        await super.init();
    }
};
