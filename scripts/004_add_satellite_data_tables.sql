/*
  # Add Satellite Data Tables

  1. New Tables
    - `satellite_ndvi_records`
      - Stores NDVI readings from satellite sources (MODIS, Landsat, Sentinel)
      - Linked to farms for location-based tracking
      - Quality metrics and cloud cover information

    - `soil_moisture_records`
      - Stores soil moisture data from SMAP satellite
      - Surface (0-5cm) and root zone (0-100cm) measurements
      - Quality indicators for data reliability

    - `natural_event_alerts`
      - Caches NASA EONET natural disaster events
      - Tracks events near farms (wildfires, floods, storms, etc.)
      - Prevents duplicate alerts for same events

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Policies for SELECT, INSERT, UPDATE, DELETE

  3. Indexes
    - Performance indexes on farm_id, date, and user_id
    - Composite indexes for common queries
*/

-- Satellite NDVI Records Table
CREATE TABLE IF NOT EXISTS satellite_ndvi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  ndvi_value DECIMAL(5, 3) NOT NULL CHECK (ndvi_value >= -1 AND ndvi_value <= 1),
  quality TEXT NOT NULL CHECK (quality IN ('excellent', 'good', 'fair', 'poor')),
  cloud_cover INTEGER CHECK (cloud_cover >= 0 AND cloud_cover <= 100),
  source TEXT NOT NULL CHECK (source IN ('MODIS', 'Landsat', 'Sentinel')),
  resolution_meters INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farm_id, date, source)
);

-- Soil Moisture Records Table
CREATE TABLE IF NOT EXISTS soil_moisture_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  surface_soil_moisture DECIMAL(5, 1) NOT NULL CHECK (surface_soil_moisture >= 0 AND surface_soil_moisture <= 100),
  root_zone_soil_moisture DECIMAL(5, 1) NOT NULL CHECK (root_zone_soil_moisture >= 0 AND root_zone_soil_moisture <= 100),
  quality TEXT NOT NULL CHECK (quality IN ('high', 'medium', 'low')),
  source TEXT DEFAULT 'SMAP',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farm_id, date)
);

-- Natural Event Alerts Cache Table
CREATE TABLE IF NOT EXISTS natural_event_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('wildfires', 'floods', 'storms', 'drought', 'earthquakes', 'volcanoes', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_km INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'closed')),
  source_link TEXT,
  alerted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE satellite_ndvi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_moisture_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE natural_event_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for satellite_ndvi_records
CREATE POLICY "Users can view their own NDVI records"
  ON satellite_ndvi_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NDVI records"
  ON satellite_ndvi_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NDVI records"
  ON satellite_ndvi_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NDVI records"
  ON satellite_ndvi_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for soil_moisture_records
CREATE POLICY "Users can view their own soil moisture records"
  ON soil_moisture_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own soil moisture records"
  ON soil_moisture_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own soil moisture records"
  ON soil_moisture_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own soil moisture records"
  ON soil_moisture_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for natural_event_alerts
CREATE POLICY "Users can view their own event alerts"
  ON natural_event_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own event alerts"
  ON natural_event_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event alerts"
  ON natural_event_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event alerts"
  ON natural_event_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_satellite_ndvi_farm_id ON satellite_ndvi_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_satellite_ndvi_user_id ON satellite_ndvi_records(user_id);
CREATE INDEX IF NOT EXISTS idx_satellite_ndvi_date ON satellite_ndvi_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_ndvi_farm_date ON satellite_ndvi_records(farm_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_soil_moisture_farm_id ON soil_moisture_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_soil_moisture_user_id ON soil_moisture_records(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_moisture_date ON soil_moisture_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_soil_moisture_farm_date ON soil_moisture_records(farm_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_natural_events_user_id ON natural_event_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_natural_events_event_id ON natural_event_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_natural_events_status ON natural_event_alerts(status);
CREATE INDEX IF NOT EXISTS idx_natural_events_severity ON natural_event_alerts(severity);
