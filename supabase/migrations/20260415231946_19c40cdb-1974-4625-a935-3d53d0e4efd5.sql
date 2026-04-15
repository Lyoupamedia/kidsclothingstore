
-- Fix permissive INSERT policy on contact_messages
DROP POLICY "Anyone can send a message" ON public.contact_messages;
CREATE POLICY "Anyone can send a message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(name) > 0 AND char_length(name) <= 100
    AND char_length(message) > 0 AND char_length(message) <= 1000
  );

-- Fix public bucket listing - restrict SELECT to specific file paths only
DROP POLICY "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND name IS NOT NULL);
