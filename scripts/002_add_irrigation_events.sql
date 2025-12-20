-- Create irrigation_events table for tracking irrigation history
CREATE TABLE IF NOT EXISTS irrigation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  irrigation_amount_mm DECIMAL(10, 2) NOT NULL,
  irrigation_method TEXT CHECK (irrigation_method IN ('drip', 'sprinkler', 'flood', 'manual', 'other')),
  soil_moisture_before DECIMAL(5, 2),
  soil_moisture_after DECIMAL(5, 2),
  notes TEXT,
  irrigated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE irrigation_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for irrigation_events
CREATE POLICY "Users can view their own irrigation events" ON irrigation_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own irrigation events" ON irrigation_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own irrigation events" ON irrigation_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own irrigation events" ON irrigation_events FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_irrigation_events_crop_id ON irrigation_events(crop_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_user_id ON irrigation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_irrigated_at ON irrigation_events(irrigated_at);
