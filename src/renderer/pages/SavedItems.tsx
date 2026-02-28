import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedService, FeedPost as FeedPostType } from '../services/feed.service';
import { profileService, ProfileData } from '../services/profile.service';
import { FeedPost } from '../components/FeedPost/FeedPost';
import { Card, CardBody } from '../components/Card/Card';
import { Button } from '../components';
import { HiBookmark, HiFolder, HiPlus, HiUser } from 'react-icons/hi';
import { useToast } from '../contexts/ToastContext';
import './SavedItems.css';

interface Collection {
  id: string;
  name: string;
  description?: string;
  savedItems?: any[];
  createdAt: string;
}

export const SavedItems: React.FC = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState<FeedPostType[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<ProfileData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'profiles'>('posts');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedCollection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [posts, profiles, cols] = await Promise.all([
        feedService.getSavedPostsByCollection(selectedCollection || undefined),
        profileService.getSavedProfiles(),
        feedService.getCollections(),
      ]);
      setSavedPosts(posts);
      setSavedProfiles(profiles);
      setCollections(cols);
    } catch (error) {
      console.error('Failed to load saved items:', error);
      showToast('Failed to load saved items', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saved-items-page">
      <div className="saved-items-header">
        <h1>Saved Items</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <HiBookmark size={18} />
            Saved Posts ({savedPosts.length})
          </button>
          <button 
            className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            <HiUser size={18} />
            Saved Profiles ({savedProfiles.length})
          </button>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="md">
          <HiPlus /> New Collection
        </Button>
      </div>

      <div className="saved-items-layout">
        <aside className="collections-sidebar">
          <button
            className={`collection-item ${!selectedCollection ? 'active' : ''}`}
            onClick={() => setSelectedCollection(null)}
          >
            <HiBookmark />
            <span>All Saved</span>
            <span className="count">{savedPosts.length}</span>
          </button>

          <div className="collections-divider" />

          <h3>Collections</h3>
          {collections.map((collection) => (
            <button
              key={collection.id}
              className={`collection-item ${selectedCollection === collection.id ? 'active' : ''}`}
              onClick={() => setSelectedCollection(collection.id)}
            >
              <HiFolder />
              <span>{collection.name}</span>
              <span className="count">{collection.savedItems?.length || 0}</span>
            </button>
          ))}
        </aside>

        <main className="saved-items-content">
          {loading ? (
            <Card>
              <CardBody>
                <div className="loading-state">Loading...</div>
              </CardBody>
            </Card>
          ) : savedPosts.length === 0 ? (
            <Card>
              <CardBody>
                <div className="empty-state">
                  <HiBookmark size={64} className="empty-icon" />
                  <h3>No saved items</h3>
                  <p>Save posts to view them here later</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              {activeTab === 'posts' && savedPosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  onDelete={loadData}
                  onLikeChange={() => {}}
                />
              ))}
              
              {activeTab === 'profiles' && (
                <div className="saved-profiles-grid">
                  {savedProfiles.map((profile) => (
                    <div key={profile.id} className="profile-card" onClick={() => navigate(`/profile/${profile.id}`)}>
                      <Card>
                        <CardBody>
                          <div className="profile-header">
                            <div className="profile-avatar">
                              {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {profile.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="profile-info">
                              <h3>{profile.name}</h3>
                              <p className="profile-role">{profile.type === 'influencer' || profile.role === 'INFLUENCER' ? 'Influencer' : 'Company'}</p>
                              {profile.location && <p className="profile-location">{profile.location}</p>}
                            </div>
                          </div>
                          {profile.bio && (
                            <p className="profile-bio">{profile.bio}</p>
                          )}
                          {profile.savedAt && (
                            <p className="saved-date">Saved {new Date(profile.savedAt).toLocaleDateString()}</p>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
};

// Simple inline modal component
const CreateCollectionModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
}> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a collection name', 'error');
      return;
    }

    try {
      setCreating(true);
      await feedService.createCollection(name, description);
      showToast('Collection created successfully', 'success');
      onCreated();
      onClose();
    } catch (error) {
      showToast('Failed to create collection', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Collection</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Collection"
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your collection..."
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
