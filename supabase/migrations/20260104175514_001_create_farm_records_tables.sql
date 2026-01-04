/*
  # Create Farm Records Tables

  1. New Tables
    - `farm_records` - Main table for all farm activities
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `farm_id` (uuid, foreign key to farms)
      - `crop_id` (uuid, optional foreign key to crops)
      - `record_type` (text: 'irrigation', 'weeding', 'pesticide', 'fertilizer', 'harvest', 'maintenance', 'cost', 'inspection', 'other')
      - `title` (text)
      - `description` (text)
      - `recorded_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `irrigation_records` - Detailed irrigation activities
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `crop_id` (uuid, foreign key to crops)
      - `irrigation_method` (text: 'drip', 'sprinkler', 'flood', 'manual', 'other')
      - `water_amount_mm` (numeric)
      - `soil_moisture_before` (numeric, 0-100)
      - `soil_moisture_after` (numeric, 0-100)
      - `duration_minutes` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `pesticide_records` - Pesticide/herbicide applications
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `crop_id` (uuid, foreign key to crops)
      - `product_name` (text)
      - `chemical_type` (text: 'insecticide', 'fungicide', 'herbicide', 'nematicide', 'other')
      - `quantity_applied` (numeric)
      - `unit` (text: 'L', 'kg', 'mL', 'g')
      - `target_issue` (text)
      - `safety_precautions` (text)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `fertilizer_records` - Fertilizer applications
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `crop_id` (uuid, foreign key to crops)
      - `product_name` (text)
      - `fertilizer_type` (text: 'organic', 'synthetic', 'foliar', 'other')
      - `quantity_applied` (numeric)
      - `unit` (text: 'kg', 'L', 'g', 'mL')
      - `npk_ratio` (text)
      - `application_method` (text: 'broadcast', 'banding', 'foliar', 'drip', 'other')
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `harvest_records` - Harvest information
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `crop_id` (uuid, foreign key to crops)
      - `quantity_harvested` (numeric)
      - `unit` (text: 'kg', 'tonnes', 'bags', 'other')
      - `quality_grade` (text: 'premium', 'grade_a', 'grade_b', 'grade_c', 'poor')
      - `harvest_date` (date)
      - `yield_per_hectare` (numeric)
      - `market_price_per_unit` (numeric)
      - `total_revenue` (numeric)
      - `storage_location` (text)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `cost_records` - Track farm expenditures
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `farm_id` (uuid, foreign key to farms)
      - `crop_id` (uuid, optional foreign key to crops)
      - `expense_type` (text: 'seeds', 'fertilizer', 'pesticide', 'labor', 'fuel', 'equipment', 'maintenance', 'other')
      - `category` (text)
      - `amount` (numeric)
      - `currency` (text, default 'USD')
      - `description` (text)
      - `date_incurred` (date)
      - `created_at` (timestamp)
    
    - `maintenance_records` - Equipment and farm maintenance
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to farm_records)
      - `user_id` (uuid, foreign key)
      - `farm_id` (uuid, foreign key to farms)
      - `equipment_name` (text)
      - `maintenance_type` (text: 'repair', 'cleaning', 'service', 'inspection', 'replacement', 'other')
      - `description` (text)
      - `cost` (numeric)
      - `date_performed` (date)
      - `next_service_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only view/edit their own records
    - Proper policies for data access control

  3. Indexes
    - Index on (user_id, recorded_date) for farm_records
    - Index on (crop_id, recorded_date) for easy filtering by crop
*/

-- Create main farm_records table
CREATE TABLE IF NOT EXISTS farm_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL,
  crop_id uuid,
  record_type text NOT NULL CHECK (record_type IN ('irrigation', 'weeding', 'pesticide', 'fertilizer', 'harvest', 'maintenance', 'cost', 'inspection', 'other')),
  title text NOT NULL,
  description text,
  recorded_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create irrigation_records table
CREATE TABLE IF NOT EXISTS irrigation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid NOT NULL,
  irrigation_method text NOT NULL CHECK (irrigation_method IN ('drip', 'sprinkler', 'flood', 'manual', 'other')),
  water_amount_mm numeric NOT NULL,
  soil_moisture_before numeric CHECK (soil_moisture_before >= 0 AND soil_moisture_before <= 100),
  soil_moisture_after numeric CHECK (soil_moisture_after >= 0 AND soil_moisture_after <= 100),
  duration_minutes integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create pesticide_records table
CREATE TABLE IF NOT EXISTS pesticide_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid NOT NULL,
  product_name text NOT NULL,
  chemical_type text NOT NULL CHECK (chemical_type IN ('insecticide', 'fungicide', 'herbicide', 'nematicide', 'other')),
  quantity_applied numeric NOT NULL,
  unit text NOT NULL CHECK (unit IN ('L', 'kg', 'mL', 'g')),
  target_issue text,
  safety_precautions text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create fertilizer_records table
CREATE TABLE IF NOT EXISTS fertilizer_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid NOT NULL,
  product_name text NOT NULL,
  fertilizer_type text NOT NULL CHECK (fertilizer_type IN ('organic', 'synthetic', 'foliar', 'other')),
  quantity_applied numeric NOT NULL,
  unit text NOT NULL CHECK (unit IN ('kg', 'L', 'g', 'mL')),
  npk_ratio text,
  application_method text NOT NULL CHECK (application_method IN ('broadcast', 'banding', 'foliar', 'drip', 'other')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create harvest_records table
CREATE TABLE IF NOT EXISTS harvest_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid NOT NULL,
  quantity_harvested numeric NOT NULL,
  unit text NOT NULL CHECK (unit IN ('kg', 'tonnes', 'bags', 'other')),
  quality_grade text NOT NULL CHECK (quality_grade IN ('premium', 'grade_a', 'grade_b', 'grade_c', 'poor')),
  harvest_date date NOT NULL,
  yield_per_hectare numeric,
  market_price_per_unit numeric,
  total_revenue numeric,
  storage_location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create cost_records table
CREATE TABLE IF NOT EXISTS cost_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL,
  crop_id uuid,
  expense_type text NOT NULL CHECK (expense_type IN ('seeds', 'fertilizer', 'pesticide', 'labor', 'fuel', 'equipment', 'maintenance', 'other')),
  category text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  date_incurred date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES farm_records(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL,
  equipment_name text NOT NULL,
  maintenance_type text NOT NULL CHECK (maintenance_type IN ('repair', 'cleaning', 'service', 'inspection', 'replacement', 'other')),
  description text,
  cost numeric,
  date_performed date NOT NULL,
  next_service_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE farm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticide_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farm_records
CREATE POLICY "Users can view own farm records"
  ON farm_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create farm records"
  ON farm_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farm records"
  ON farm_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farm records"
  ON farm_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for irrigation_records
CREATE POLICY "Users can view own irrigation records"
  ON irrigation_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create irrigation records"
  ON irrigation_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own irrigation records"
  ON irrigation_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own irrigation records"
  ON irrigation_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pesticide_records
CREATE POLICY "Users can view own pesticide records"
  ON pesticide_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pesticide records"
  ON pesticide_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pesticide records"
  ON pesticide_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pesticide records"
  ON pesticide_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for fertilizer_records
CREATE POLICY "Users can view own fertilizer records"
  ON fertilizer_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create fertilizer records"
  ON fertilizer_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fertilizer records"
  ON fertilizer_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fertilizer records"
  ON fertilizer_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for harvest_records
CREATE POLICY "Users can view own harvest records"
  ON harvest_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create harvest records"
  ON harvest_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvest records"
  ON harvest_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvest records"
  ON harvest_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for cost_records
CREATE POLICY "Users can view own cost records"
  ON cost_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create cost records"
  ON cost_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cost records"
  ON cost_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cost records"
  ON cost_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for maintenance_records
CREATE POLICY "Users can view own maintenance records"
  ON maintenance_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create maintenance records"
  ON maintenance_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maintenance records"
  ON maintenance_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own maintenance records"
  ON maintenance_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_farm_records_user_date ON farm_records(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_records_crop ON farm_records(crop_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_records_type ON farm_records(record_type, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_records_farm ON cost_records(farm_id, date_incurred DESC);
CREATE INDEX IF NOT EXISTS idx_harvest_records_crop ON harvest_records(crop_id, harvest_date DESC);
