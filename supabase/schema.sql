-- Lunomi POS - Supabase Database Schema
-- Multi-Industry, Multi-Tenant Architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE (Multi-Tenant Root)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('fnb', 'retail', 'pharmacy', 'salon', 'automotive', 'service')),
  is_multi_outlet BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('outlet', 'warehouse', 'both')),
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  type TEXT CHECK (type IN ('physical', 'service', 'bundle', 'digital')),
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  membership_tier TEXT DEFAULT 'regular',
  loyalty_points INTEGER DEFAULT 0,
  store_credit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  customer_id UUID REFERENCES customers(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  order_type TEXT CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'appointment', 'pickup')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  payment_methods JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY TABLE
-- ============================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, product_id)
);

-- ============================================
-- USER COMPANIES (Multi-Tenant Access Control)
-- ============================================
CREATE TABLE user_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'kitchen', 'warehouse')),
  location_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_locations_company ON locations(company_id);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_orders_company ON orders(company_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_user_companies_user ON user_companies(user_id);
CREATE INDEX idx_user_companies_company ON user_companies(company_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Companies: Users can only see companies they belong to
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

-- Locations: Users can only see locations of their companies
CREATE POLICY "Users can view their company locations" ON locations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

-- Products: Users can view and manage products of their companies
CREATE POLICY "Users can view their company products" ON products
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can insert products" ON products
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Orders: Users can view orders of their companies
CREATE POLICY "Users can view their company orders" ON orders
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can create orders" ON orders
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'cashier')
    )
  );

CREATE POLICY "Staff can update orders" ON orders
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'cashier', 'kitchen')
    )
  );

-- Order Items: Inherit from orders
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT company_id FROM user_companies 
        WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'cashier')
      )
    )
  );

-- Customers: Users can view customers of their companies
CREATE POLICY "Users can view their company customers" ON customers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

-- Inventory: Users can view inventory of their companies
CREATE POLICY "Users can view inventory" ON inventory
  FOR SELECT USING (
    location_id IN (
      SELECT id FROM locations WHERE company_id IN (
        SELECT company_id FROM user_companies WHERE user_id = auth.uid()
      )
    )
  );

-- User Companies: Users can only see their own access
CREATE POLICY "Users can view their own access" ON user_companies
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEMO DATA (Optional - for testing)
-- ============================================

-- Insert demo company
INSERT INTO companies (id, name, business_type, is_multi_outlet, settings) VALUES
('00000000-0000-0000-0000-000000000001', 'Cleco Group', 'fnb', true, '{"currency": "IDR", "timezone": "Asia/Jakarta", "taxRate": 0.11}');

-- Insert demo location
INSERT INTO locations (id, company_id, name, type, address, phone) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Cleco Pii', 'outlet', 'Jl. Sudirman No. 12, Jakarta', '021-12345678');

-- Insert demo products
INSERT INTO products (company_id, name, category, price, cost_price, type) VALUES
('00000000-0000-0000-0000-000000000001', 'Nasi Goreng Spesial', 'Makanan', 35000, 15000, 'physical'),
('00000000-0000-0000-0000-000000000001', 'Mie Goreng', 'Makanan', 30000, 12000, 'physical'),
('00000000-0000-0000-0000-000000000001', 'Ayam Bakar Madu', 'Makanan', 45000, 20000, 'physical'),
('00000000-0000-0000-0000-000000000001', 'Es Teh Manis', 'Minuman', 8000, 2000, 'physical'),
('00000000-0000-0000-0000-000000000001', 'Kopi Hitam', 'Minuman', 12000, 4000, 'physical');
