-- Create farm_records table to consolidate all farm activity records
CREATE TABLE IF NOT EXISTS farm_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('irrigation', 'pesticide', 'fertilizer', 'harvest', 'cost', 'maintenance')),
  title TEXT NOT NULL,
  description TEXT,
  details JSONB,
  recorded_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE farm_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farm_records
CREATE POLICY "Users can view their own farm records" ON farm_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own farm records" ON farm_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own farm records" ON farm_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own farm records" ON farm_records FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farm_records_user_id ON farm_records(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_farm_id ON farm_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_crop_id ON farm_records(crop_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_type ON farm_records(record_type);
CREATE INDEX IF NOT EXISTS idx_farm_records_date ON farm_records(recorded_date DESC);
