-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'DE',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiso_article_id TEXT UNIQUE,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  format_size TEXT NOT NULL,
  aspect_ratio DECIMAL(4,2),
  base_price_cents INTEGER NOT NULL,
  material TEXT DEFAULT 'Matte Paper 250g',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_print', 'printed', 'shipped', 'cancelled')),
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  wiso_invoice_id TEXT,
  wiso_customer_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  print_job_id TEXT,
  print_folder_path TEXT,
  printed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  image_source TEXT CHECK (image_source IN ('upload', 'ai_generation')),
  original_image_url TEXT,
  processed_image_url TEXT,
  ai_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generations
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_item_id UUID REFERENCES order_items(id),
  prompt TEXT,
  replicate_prediction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url TEXT,
  cost_cents INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- WISO Sync Log
CREATE TABLE wiso_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'invoice', 'article')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'sync')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  request_payload JSONB,
  response_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Printer Status (HP DesignJet Z2100)
CREATE TABLE printer_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printer_name TEXT DEFAULT 'HP DesignJet Z2100',
  ip_address TEXT NOT NULL,
  online BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('ready', 'printing', 'error', 'offline')),
  ink_cyan INTEGER CHECK (ink_cyan BETWEEN 0 AND 100),
  ink_magenta INTEGER CHECK (ink_magenta BETWEEN 0 AND 100),
  ink_yellow INTEGER CHECK (ink_yellow BETWEEN 0 AND 100),
  ink_black INTEGER CHECK (ink_black BETWEEN 0 AND 100),
  ink_light_cyan INTEGER CHECK (ink_light_cyan BETWEEN 0 AND 100),
  ink_light_magenta INTEGER CHECK (ink_light_magenta BETWEEN 0 AND 100),
  paper_loaded BOOLEAN DEFAULT false,
  paper_type TEXT,
  paper_remaining_percent INTEGER CHECK (paper_remaining_percent BETWEEN 0 AND 100),
  error_code TEXT,
  error_message TEXT,
  polled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for latest status lookup
CREATE INDEX idx_printer_status_polled_at ON printer_status(polled_at DESC);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL USING (true);

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );