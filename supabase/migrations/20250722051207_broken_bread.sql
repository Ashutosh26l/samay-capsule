/*
  # Time Capsule AI Database Schema

  1. New Tables
    - `capsules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, capsule title)
      - `content` (text, user's message/thoughts)
      - `file_url` (text, optional audio/video file path)
      - `file_type` (text, optional file type)
      - `release_date` (timestamp, unlock date)
      - `created_at` (timestamp, creation time)
      - `ai_summary` (text, AI-generated summary)
      - `ai_future_reply` (text, future-self response from AI)
      - `is_public` (boolean, for potential public sharing)
      - `is_unlocked` (boolean, manual unlock override)

  2. Security
    - Enable RLS on `capsules` table
    - Add policies for authenticated users to manage their own capsules
    - Add policy for viewing unlocked capsules

  3. Storage
    - Create bucket for capsule media files
*/

CREATE TABLE IF NOT EXISTS capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  file_url text,
  file_type text,
  release_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ai_summary text,
  ai_future_reply text,
  is_public boolean DEFAULT false,
  is_unlocked boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

-- Policies for capsules
CREATE POLICY "Users can create their own capsules"
  ON capsules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own capsules"
  ON capsules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own capsules"
  ON capsules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capsules"
  ON capsules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for capsule media
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsule-media', 'capsule-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own capsule media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own capsule media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own capsule media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);