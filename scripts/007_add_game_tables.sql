-- Game Tables for Smart Farming Game

-- Game Farms table
CREATE TABLE IF NOT EXISTS game_farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  size_hectares FLOAT DEFAULT 10,
  total_points INT DEFAULT 0,
  total_harvests INT DEFAULT 0,
  best_yield INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game Crops table
CREATE TABLE IF NOT EXISTS game_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_farm_id UUID NOT NULL REFERENCES game_farms(id) ON DELETE CASCADE,
  crop_type VARCHAR(100) NOT NULL,
  planted_date TIMESTAMP NOT NULL,
  growth_stage VARCHAR(50) DEFAULT 'seedling', -- seedling, vegetative, flowering, fruiting, mature
  health_score FLOAT DEFAULT 100, -- 0-100
  water_level FLOAT DEFAULT 50, -- 0-100
  nutrient_level FLOAT DEFAULT 50, -- 0-100
  expected_yield INT DEFAULT 0,
  disease_risk FLOAT DEFAULT 0, -- 0-1
  harvested BOOLEAN DEFAULT FALSE,
  harvest_date TIMESTAMP,
  final_yield INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game Resources table
CREATE TABLE IF NOT EXISTS game_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_farm_id UUID NOT NULL REFERENCES game_farms(id) ON DELETE CASCADE,
  water_available INT DEFAULT 1000,
  water_capacity INT DEFAULT 1000,
  fertilizer_available INT DEFAULT 500,
  fertilizer_capacity INT DEFAULT 500,
  seeds_available INT DEFAULT 100,
  cash INT DEFAULT 5000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game Weather Effects table (stores daily NASA data for the game)
CREATE TABLE IF NOT EXISTS game_weather_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_farm_id UUID NOT NULL REFERENCES game_farms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature FLOAT,
  rainfall FLOAT,
  humidity FLOAT,
  wind_speed FLOAT,
  solar_radiation FLOAT,
  crop_id UUID REFERENCES game_crops(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game Achievements table
CREATE TABLE IF NOT EXISTS game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points_earned INT DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Game Leaderboard table
CREATE TABLE IF NOT EXISTS game_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  total_harvests INT DEFAULT 0,
  best_yield INT DEFAULT 0,
  average_health FLOAT DEFAULT 0,
  rank INT,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE game_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_weather_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own game farms" ON game_farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own game farms" ON game_farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own game farms" ON game_farms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own game farms" ON game_farms FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their crops" ON game_crops FOR ALL USING (
  game_farm_id IN (SELECT id FROM game_farms WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their resources" ON game_resources FOR ALL USING (
  game_farm_id IN (SELECT id FROM game_farms WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view weather effects for their farms" ON game_weather_effects FOR ALL USING (
  game_farm_id IN (SELECT id FROM game_farms WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their achievements" ON game_achievements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboards" ON game_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can manage their leaderboard entries" ON game_leaderboard FOR ALL USING (auth.uid() = user_id);
