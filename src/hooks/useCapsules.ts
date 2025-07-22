import { useState, useEffect, useCallback } from 'react';
import { supabase, type Capsule } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useCapsules() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCapsules = async () => {
    if (!user) {
      setCapsules([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error) {
      console.error('Error fetching capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [user]);

  const createCapsule = async (capsuleData: {
    title: string;
    content: string;
    releaseDate: string;
    file?: File;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      let fileUrl = null;
      let fileType = null;

      // Upload file if provided
      if (capsuleData.file) {
        const fileExt = capsuleData.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('capsule-media')
          .upload(filePath, capsuleData.file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('capsule-media')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

        if (data?.signedUrl) {
          fileUrl = data.signedUrl;
        } else {
          throw new Error('Failed to generate signed URL for media file');
        }
        fileType = capsuleData.file.type;
      }

      // Create capsule
      const { data, error } = await supabase
        .from('capsules')
        .insert({
          user_id: user.id,
          title: capsuleData.title,
          content: capsuleData.content,
          release_date: capsuleData.releaseDate,
          file_url: fileUrl,
          file_type: fileType
        })
        .select()
        .single();

      if (error) throw error;

      // Process with AI
      if (data) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-capsule-ai`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              capsuleId: data.id,
              title: capsuleData.title,
              content: capsuleData.content
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('AI processing failed:', errorData);
          } else {
            const result = await response.json();
            console.log('AI processing successful:', result);
          }
        } catch (aiError) {
          console.error('AI processing failed:', aiError);
          // Continue even if AI processing fails
        }
      }

      await fetchCapsules();
      return data;
    } catch (error) {
      console.error('Error creating capsule:', error);
      throw error;
    }
  };

  const getCapsule = useCallback(async (id: string): Promise<Capsule | null> => {
    if (!user?.id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching capsule:', error);
      return null;
    }
  }, [user]);

  return {
    capsules,
    loading,
    createCapsule,
    getCapsule,
    refetch: fetchCapsules
  };
}