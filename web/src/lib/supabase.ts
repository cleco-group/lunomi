import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          business_type: 'fnb' | 'retail' | 'pharmacy' | 'salon' | 'automotive' | 'service';
          is_multi_outlet: boolean;
          settings: any;
          created_at: string;
          updated_at: string;
        };
      };
      locations: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          type: 'outlet' | 'warehouse' | 'both';
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          category: string;
          price: number;
          cost_price: number | null;
          type: 'physical' | 'service' | 'bundle' | 'digital';
          custom_fields: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          company_id: string;
          location_id: string | null;
          customer_id: string | null;
          order_number: string;
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          order_type: 'dine_in' | 'takeaway' | 'delivery' | 'appointment' | 'pickup';
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          amount_paid: number;
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
          payment_methods: string[];
          custom_fields: any;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          qty: number;
          price: number;
          discount: number;
          subtotal: number;
          notes: string | null;
          created_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          membership_tier: string;
          loyalty_points: number;
          store_credit: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
