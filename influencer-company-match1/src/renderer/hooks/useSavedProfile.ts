import { useState, useEffect } from 'react';
import { profileService } from '../services/profile.service';

export const useSavedProfile = (profileId?: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    
    const checkSaved = async () => {
      try {
        const saved = await profileService.isProfileSaved(profileId);
        setIsSaved(saved);
      } catch (error) {
        console.error('Failed to check saved status:', error);
      }
    };
    
    checkSaved();
  }, [profileId]);

  const toggleSave = async () => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      if (isSaved) {
        await profileService.unsaveProfile(profileId);
        setIsSaved(false);
      } else {
        await profileService.saveProfile(profileId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggleSave };
};
