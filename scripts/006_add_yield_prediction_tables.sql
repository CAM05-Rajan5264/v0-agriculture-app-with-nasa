-- Create crop_yield_predictions table
CREATE TABLE IF NOT EXISTS crop_yield_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  predicted_yield DECIMAL(10, 2) NOT NULL,
  yield_unit TEXT DEFAULT 'kg' CHECK (yield_unit IN ('kg', 'tons', 'bags', 'bushels')),
  confidence_score DECIMAL(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  prediction_factors JSONB,
  model_version TEXT,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prediction_for_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crop_yield_actuals table for tracking actual yields after harvest
CREATE TABLE IF NOT EXISTS crop_yield_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  actual_yield DECIMAL(10, 2) NOT NULL,
  yield_unit TEXT DEFAULT 'kg' CHECK (yield_unit IN ('kg', 'tons', 'bags', 'bushels')),
  harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crop_historical_yields table for storing historical yield data
CREATE TABLE IF NOT EXISTS crop_historical_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  season_year INTEGER,
  average_yield DECIMAL(10, 2),
  yield_unit TEXT DEFAULT 'kg' CHECK (yield_unit IN ('kg', 'tons', 'bags', 'bushels')),
  weather_conditions JSONB,
  soil_quality_score DECIMAL(3, 2),
  irrigation_applied DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE crop_yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_yield_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_historical_yields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_yield_predictions
CREATE POLICY "Users can view their own yield predictions" ON crop_yield_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own yield predictions" ON crop_yield_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own yield predictions" ON crop_yield_predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own yield predictions" ON crop_yield_predictions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for crop_yield_actuals
CREATE POLICY "Users can view their own yield actuals" ON crop_yield_actuals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own yield actuals" ON crop_yield_actuals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own yield actuals" ON crop_yield_actuals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own yield actuals" ON crop_yield_actuals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for crop_historical_yields
CREATE POLICY "Users can view their own historical yields" ON crop_historical_yields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own historical yields" ON crop_historical_yields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own historical yields" ON crop_historical_yields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own historical yields" ON crop_historical_yields FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yield_predictions_crop_id ON crop_yield_predictions(crop_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_farm_id ON crop_yield_predictions(farm_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_user_id ON crop_yield_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_actuals_crop_id ON crop_yield_actuals(crop_id);
CREATE INDEX IF NOT EXISTS idx_yield_actuals_farm_id ON crop_yield_actuals(farm_id);
CREATE INDEX IF NOT EXISTS idx_historical_yields_user_id ON crop_historical_yields(user_id);
