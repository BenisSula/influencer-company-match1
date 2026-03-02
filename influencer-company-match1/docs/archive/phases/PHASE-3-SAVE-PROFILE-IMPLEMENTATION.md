# Phase 3: Save Profile Feature - Implementation Guide

## Status: Ready to Implement

This document provides the implementation steps for the Save Profile feature, reusing existing patterns from the SavedItems system.

---

## Backend Implementation

### 1. Database Migration ✅ CREATED
- File: `backend/src/database/migrations/1707594000000-CreateSavedProfilesTable.ts`
- Creates `saved_profiles` table with:
  - user_id (who saved)
  - saved_profile_id (profile being saved)
  - notes (optional)
  - tags (optional array)
  - created_at timestamp
  - Unique constraint on (user_id, saved_profile_id)

### 2. Entity ✅ CREATED
- File: `backend/src/modules/profiles/entities/saved-profile.entity.ts`
- SavedProfile entity with relationships to User

### 3. Extend ProfilesService
Add these methods to `backend/src/modules/profiles/profiles.service.ts`:

```typescript
// Add to imports
import { SavedProfile } from './entities/saved-profile.entity';

// Add to constructor
@InjectRepository(SavedProfile)
private readonly savedProfileRepo: Repository<SavedProfile>,

// Add methods before closing brace
async saveProfile(userId: string, profileId: string, notes?: string, tags?: string[]): Promise<SavedProfile> {
  // Check if already saved
  const existing = await this.savedProfileRepo.findOne({
    where: { userId, savedProfileId: profileId }
  });
  
  if (existing) {
    // Update notes/tags if provided
    if (notes !== undefined) existing.notes = notes;
    if (tags !== undefined) existing.tags = tags;
    return this.savedProfileRepo.save(existing);
  }
  
  const savedProfile = this.savedProfileRepo.create({
    userId,
    savedProfileId: profileId,
    notes,
    tags,
  });
  
  return this.savedProfileRepo.save(savedProfile);
}

async unsaveProfile(userId: string, profileId: string): Promise<void> {
  await this.savedProfileRepo.delete({
    userId,
    savedProfileId: profileId,
  });
}

async getSavedProfiles(userId: string): Promise<any[]> {
  const saved = await this.savedProfileRepo.find({
    where: { userId },
    relations: ['savedProfile'],
    order: { createdAt: 'DESC' },
  });
  
  // Get full profile data for each saved profile
  const profiles = await Promise.all(
    saved.map(async (s) => {
      const profile = await this.getProfileByUserId(s.savedProfileId);
      return {
        ...profile,
        savedAt: s.createdAt,
        notes: s.notes,
        tags: s.tags,
      };
    })
  );
  
  return profiles;
}

async isProfileSaved(userId: string, profileId: string): Promise<boolean> {
  const count = await this.savedProfileRepo.count({
    where: { userId, savedProfileId: profileId },
  });
  return count > 0;
}
```

### 4. Extend ProfilesController
Add these endpoints to `backend/src/modules/profiles/profiles.controller.ts`:

```typescript
@Post(':profileId/save')
async saveProfile(
  @Request() req: any,
  @Param('profileId') profileId: string,
  @Body() body: { notes?: string; tags?: string[] },
) {
  return this.profilesService.saveProfile(
    req.user.sub,
    profileId,
    body.notes,
    body.tags,
  );
}

@Delete(':profileId/save')
async unsaveProfile(
  @Request() req: any,
  @Param('profileId') profileId: string,
) {
  await this.profilesService.unsaveProfile(req.user.sub, profileId);
  return { message: 'Profile unsaved successfully' };
}

@Get('saved')
async getSavedProfiles(@Request() req: any) {
  return this.profilesService.getSavedProfiles(req.user.sub);
}

@Get(':profileId/saved-status')
async getProfileSavedStatus(
  @Request() req: any,
  @Param('profileId') profileId: string,
) {
  const saved = await this.profilesService.isProfileSaved(req.user.sub, profileId);
  return { saved };
}
```

### 5. Update ProfilesModule
Add SavedProfile entity to `backend/src/modules/profiles/profiles.module.ts`:

```typescript
import { SavedProfile } from './entities/saved-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfluencerProfile,
      CompanyProfile,
      SavedProfile, // Add this
    ]),
  ],
  // ...
})
```

---

## Frontend Implementation

### 1. Create Profile Service
Add to `src/renderer/services/profile.service.ts`:

```typescript
async saveProfile(profileId: string, notes?: string, tags?: string[]): Promise<void> {
  await apiClient.post(`/profiles/${profileId}/save`, { notes, tags });
}

async unsaveProfile(profileId: string): Promise<void> {
  await apiClient.delete(`/profiles/${profileId}/save`);
}

async getSavedProfiles(): Promise<ProfileData[]> {
  return apiClient.get('/profiles/saved');
}

async isProfileSaved(profileId: string): Promise<boolean> {
  const response = await apiClient.get<{ saved: boolean }>(`/profiles/${profileId}/saved-status`);
  return response.saved;
}
```

### 2. Create useSavedProfile Hook
Create `src/renderer/hooks/useSavedProfile.ts`:

```typescript
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
```

### 3. Update ProfileView Component
Add to `src/renderer/pages/ProfileView.tsx`:

```typescript
// Add imports
import { HiBookmark, HiOutlineBookmark } from 'react-icons/hi';
import { useSavedProfile } from '../hooks/useSavedProfile';
import { CollaborationRequestModal } from '../components/CollaborationRequestModal/CollaborationRequestModal';

// Add state
const [collaborationModalOpen, setCollaborationModalOpen] = useState(false);
const { isSaved, loading: saveLoading, toggleSave } = useSavedProfile(id);

// Add save handler
const handleToggleSave = async () => {
  try {
    await toggleSave();
    showToast(isSaved ? 'Profile unsaved' : 'Profile saved!', 'success');
  } catch (error) {
    showToast('Failed to save profile', 'error');
  }
};

// Update action buttons section (after Back button, before Send Message)
{!isOwnProfile && (
  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
      <HiArrowLeft size={20} />
      Back
    </Button>
    
    <Button
      variant="primary"
      size="sm"
      onClick={() => setCollaborationModalOpen(true)}
    >
      <HiStar size={20} />
      Request Collaboration
    </Button>
    
    <Button
      variant="secondary"
      size="sm"
      onClick={handleToggleSave}
      disabled={saveLoading}
    >
      {isSaved ? <HiBookmark size={20} /> : <HiOutlineBookmark size={20} />}
      {isSaved ? 'Saved' : 'Save Profile'}
    </Button>
    
    <Button variant="secondary" size="sm" onClick={handleSendMessage}>
      <HiMail size={20} />
      Message
    </Button>
  </div>
)}

// Add modal at end of component
{!isOwnProfile && profile && (
  <CollaborationRequestModal
    recipientId={id!}
    recipientName={profile.name}
    isOpen={collaborationModalOpen}
    onClose={() => setCollaborationModalOpen(false)}
    onSuccess={() => {
      showToast('Collaboration request sent!', 'success');
    }}
  />
)}
```

### 4. Extend SavedItems Page
Update `src/renderer/pages/SavedItems.tsx` to include saved profiles:

```typescript
// Add state
const [savedProfiles, setSavedProfiles] = useState<ProfileData[]>([]);
const [activeTab, setActiveTab] = useState<'posts' | 'profiles'>('posts');

// Update fetch function
const fetchSavedItems = async () => {
  try {
    setLoading(true);
    const [posts, profiles] = await Promise.all([
      feedService.getSavedPostsByCollection(selectedCollection || undefined),
      profileService.getSavedProfiles(),
    ]);
    setSavedPosts(posts);
    setSavedProfiles(profiles);
  } catch (error) {
    console.error('Failed to load saved items:', error);
    showToast('Failed to load saved items', 'error');
  } finally {
    setLoading(false);
  }
};

// Add tab switcher in UI
<div className="tabs">
  <button 
    className={activeTab === 'posts' ? 'active' : ''}
    onClick={() => setActiveTab('posts')}
  >
    Saved Posts ({savedPosts.length})
  </button>
  <button 
    className={activeTab === 'profiles' ? 'active' : ''}
    onClick={() => setActiveTab('profiles')}
  >
    Saved Profiles ({savedProfiles.length})
  </button>
</div>

// Render saved profiles when activeTab === 'profiles'
{activeTab === 'profiles' && (
  <div className="saved-profiles-grid">
    {savedProfiles.map((profile) => (
      <ProfileCard key={profile.id} profile={profile} />
    ))}
  </div>
)}
```

---

## Testing Checklist

- [ ] Run migration: `npm run typeorm migration:run`
- [ ] Test save profile from ProfileView
- [ ] Test unsave profile
- [ ] Verify saved status persists on page reload
- [ ] Test viewing saved profiles in SavedItems page
- [ ] Test Request Collaboration button opens modal
- [ ] Test sending collaboration request
- [ ] Verify button states (saved/unsaved)
- [ ] Test with multiple profiles
- [ ] Verify database constraints (unique user+profile)

---

## Summary

This implementation:
- ✅ Reuses existing SavedItems patterns
- ✅ Extends existing CollaborationRequestModal
- ✅ Adds minimal new code
- ✅ Follows existing architecture
- ✅ Provides complete save profile functionality
- ✅ Integrates Request Collaboration button

**Estimated Time:** 2-3 hours
**Priority:** HIGH
**Dependencies:** None (all components exist)
