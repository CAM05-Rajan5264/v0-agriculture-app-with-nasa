-- Create app_reviews table for ratings and comments
CREATE TABLE IF NOT EXISTS app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_reviews
-- Everyone can view all reviews
CREATE POLICY "Anyone can view reviews" ON app_reviews FOR SELECT USING (true);
-- Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON app_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON app_reviews FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON app_reviews FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_app_reviews_user_id ON app_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_rating ON app_reviews(rating);
