-- Create storage bucket for deck images
INSERT INTO storage.buckets (id, name, public)
VALUES ('deck-images', 'deck-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for deck images
CREATE POLICY "Anyone can view deck images" ON storage.objects
  FOR SELECT USING (bucket_id = 'deck-images');

CREATE POLICY "Authenticated users can upload deck images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'deck-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own deck images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'deck-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own deck images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'deck-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
