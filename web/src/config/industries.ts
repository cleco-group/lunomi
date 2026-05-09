export interface IndustryConfig {
  id: string;
  name: string;
  type: 'fnb' | 'retail' | 'pharmacy' | 'salon' | 'automotive' | 'service';
  features: {
    hasKitchenDisplay: boolean;
    hasAppointments: boolean;
    hasTableManagement: boolean;
    hasInventoryTracking: boolean;
    hasPrescriptions: boolean;
    hasServiceQueue: boolean;
  };
  orderTypes: Array<'dine_in' | 'takeaway' | 'delivery' | 'appointment' | 'pickup'>;
  productTypes: Array<'physical' | 'service' | 'bundle' | 'digital'>;
  customFields: {
    product?: Record<string, any>;
    order?: Record<string, any>;
    customer?: Record<string, any>;
  };
}

export const INDUSTRIES: Record<string, IndustryConfig> = {
  fnb: {
    id: 'fnb',
    name: 'Food & Beverage',
    type: 'fnb',
    features: {
      hasKitchenDisplay: true,
      hasAppointments: false,
      hasTableManagement: true,
      hasInventoryTracking: true,
      hasPrescriptions: false,
      hasServiceQueue: false
    },
    orderTypes: ['dine_in', 'takeaway', 'delivery'],
    productTypes: ['physical'],
    customFields: {
      product: { 
        portion: 'string', 
        spicyLevel: 'number',
        cookingTime: 'number'
      },
      order: { 
        tableNumber: 'string', 
        specialInstructions: 'string',
        servingTime: 'datetime'
      }
    }
  },
  
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy',
    type: 'pharmacy',
    features: {
      hasKitchenDisplay: false,
      hasAppointments: false,
      hasTableManagement: false,
      hasInventoryTracking: true,
      hasPrescriptions: true,
      hasServiceQueue: true
    },
    orderTypes: ['pickup', 'delivery'],
    productTypes: ['physical'],
    customFields: {
      product: { 
        dosage: 'string', 
        expiryDate: 'date', 
        requiresPrescription: 'boolean',
        activeIngredient: 'string'
      },
      order: { 
        prescriptionNumber: 'string', 
        doctorName: 'string',
        patientName: 'string'
      }
    }
  },
  
  salon: {
    id: 'salon',
    name: 'Beauty & Salon',
    type: 'salon',
    features: {
      hasKitchenDisplay: false,
      hasAppointments: true,
      hasTableManagement: false,
      hasInventoryTracking: false,
      hasPrescriptions: false,
      hasServiceQueue: true
    },
    orderTypes: ['appointment'],
    productTypes: ['service'],
    customFields: {
      product: { 
        duration: 'number', 
        stylistRequired: 'boolean',
        category: 'string'
      },
      order: { 
        appointmentTime: 'datetime', 
        stylistId: 'string',
        stylistName: 'string'
      }
    }
  },
  
  retail: {
    id: 'retail',
    name: 'Retail Store',
    type: 'retail',
    features: {
      hasKitchenDisplay: false,
      hasAppointments: false,
      hasTableManagement: false,
      hasInventoryTracking: true,
      hasPrescriptions: false,
      hasServiceQueue: false
    },
    orderTypes: ['pickup', 'delivery'],
    productTypes: ['physical'],
    customFields: {
      product: { 
        size: 'string', 
        color: 'string',
        brand: 'string',
        sku: 'string'
      },
      order: { 
        shippingAddress: 'string',
        trackingNumber: 'string'
      }
    }
  }
};

export function getIndustryConfig(industryId: string): IndustryConfig {
  return INDUSTRIES[industryId] || INDUSTRIES.fnb; // Default to F&B
}
