-- Create farming_activities table to track all farm activities
CREATE TABLE IF NOT EXISTS farming_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('pesticide', 'fertilizer', 'harvest', 'maintenance')),
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  -- Common fields
  notes TEXT,
  -- Pesticide/Disease Treatment specific
  product_name TEXT,
  quantity_applied DECIMAL(10, 2),
  unit_of_measurement TEXT, -- kg, liters, ml
  disease_treated TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  -- Fertilizer specific
  fertilizer_type TEXT, -- NPK, Organic, Micronutrients, etc
  nitrogen_amount DECIMAL(10, 2),
  phosphorus_amount DECIMAL(10, 2),
  potassium_amount DECIMAL(10, 2),
  -- Harvest specific
  quantity_harvested DECIMAL(10, 2),
  harvest_unit TEXT, -- tons, kg, quintals
  quality_grade TEXT, -- A, B, C
  market_price_per_unit DECIMAL(10, 2),
  -- Maintenance specific
  equipment_name TEXT,
  maintenance_type TEXT, -- service, repair, replacement
  cost DECIMAL(12, 2),
  service_provider TEXT,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disease_detection table for AI analysis results
CREATE TABLE IF NOT EXISTS disease_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detected_disease TEXT,
  confidence_score DECIMAL(4, 3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  symptoms TEXT[],
  recommended_treatment TEXT,
  treatment_urgency TEXT CHECK (treatment_urgency IN ('low', 'medium', 'high', 'critical')),
  raw_analysis TEXT, -- Store full AI response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farming_activities
CREATE POLICY "Users can view their own farming activities" ON farming_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own farming activities" ON farming_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own farming activities" ON farming_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own farming activities" ON farming_activities FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for disease_detections
CREATE POLICY "Users can view their own disease detections" ON disease_detections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own disease detections" ON disease_detections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own disease detections" ON disease_detections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own disease detections" ON disease_detections FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_farming_activities_user_id ON farming_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_crop_id ON farming_activities(crop_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_farm_id ON farming_activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_type ON farming_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_disease_detections_user_id ON disease_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_crop_id ON disease_detections(crop_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_analysis_date ON disease_detections(analysis_date);
