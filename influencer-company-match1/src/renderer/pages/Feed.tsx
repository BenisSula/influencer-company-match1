import { useState, useEffect } from 'react';
import { Card, CardBody, Button } from '../components';
import { FeedPost } from '../components/FeedPost/FeedPost';
import { CreatePost } from '../components/CreatePost/CreatePost';
import { FeedFilters, FeedFilterOptions } from '../components/FeedFilters';
import { feedService, FeedPost as FeedPostType } from '../services/feed.service';
import { useToast } from '../contexts/ToastContext';
import { HiPlus, HiRefresh } from 'react-icons/hi';
import './Feed.css';

export const Feed = () => {
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FeedPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showToast } = useToast();
  
  // Feed filters state
  const [filters, setFilters] = useState<FeedFilterOptions>({
    tab: 'all',
    postTypes: [],
    dateRange: 'all',
  });

  useEffect(() => {
    loadFeed();
  }, []);

  // Apply filters whenever posts or filters change
  useEffect(() => {
    applyFilters();
  }, [posts, filters]);

  const applyFilters = () => {
    let filtered = [...posts];

    // Apply post type filter
    if (filters.postTypes.length > 0) {
      filtered = filtered.filter(post => filters.postTypes.includes(post.postType));
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => new Date(post.createdAt) >= filterDate);
    }

    // Apply tab filter (connections/matches would need backend support)
    // For now, we'll just use the filtered posts
    setFilteredPosts(filtered);
  };

  const handleFilterChange = (newFilters: FeedFilterOptions) => {
    setFilters(newFilters);
    // Save filters to localStorage for persistence
    localStorage.setItem('feedFilters', JSON.stringify(newFilters));
  };

  const handleClearFilters = () => {
    const defaultFilters: FeedFilterOptions = {
      tab: 'all',
      postTypes: [],
      dateRange: 'all',
    };
    setFilters(defaultFilters);
    localStorage.removeItem('feedFilters');
  };

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('feedFilters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  const loadFeed = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Use personalized feed for intelligent prioritization
      const response = await feedService.getPersonalizedFeed({ page: pageNum, limit: 20 });

      if (pageNum === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }

      setHasMore(response.meta.page < response.meta.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load feed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadFeed(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFeed(page + 1);
    }
  };

  const handlePostCreated = async () => {
    // Reload feed from page 1 to show the newly created post at the TOP
    // Backend orders by createdAt DESC, so newest posts appear first
    await loadFeed(1);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('Post deleted', 'success');
  };

  return (
    <div className="feed-page">
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div className="feed-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: '0 0 0.25rem 0' }}>
                Feed
              </h2>
              <p style={{ fontSize: '0.9375rem', color: '#65676B', margin: 0 }}>
                Share updates and connect with the community
              </p>
            </div>
            <div className="feed-header-actions">
              <Button
                variant="ghost"
                size="md"
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh feed"
              >
                <HiRefresh size={20} />
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowCreatePost(true)}
              >
                <HiPlus size={20} />
                <span className="hide-mobile">Create Post</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feed Filters */}
      <FeedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {loading && posts.length === 0 && (
        <>
          <Card style={{ marginBottom: '1rem' }}>
            <CardBody>
              <div className="feed-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-text-group">
                    <div className="skeleton-text skeleton-text-short"></div>
                    <div className="skeleton-text skeleton-text-shorter"></div>
                  </div>
                </div>
                <div className="skeleton-content">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text skeleton-text-short"></div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card style={{ marginBottom: '1rem' }}>
            <CardBody>
              <div className="feed-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-text-group">
                    <div className="skeleton-text skeleton-text-short"></div>
                    <div className="skeleton-text skeleton-text-shorter"></div>
                  </div>
                </div>
                <div className="skeleton-content">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {error && (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>
              <Button variant="primary" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && posts.length === 0 && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something with the community!</p>
              <Button
                variant="primary"
                onClick={() => setShowCreatePost(true)}
                style={{ marginTop: '1rem' }}
              >
                Create Your First Post
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {filteredPosts.map((post) => (
        <FeedPost
          key={post.id}
          post={post}
          onDelete={() => handlePostDeleted(post.id)}
          onLikeChange={() => { }}
        />
      ))}

      {!loading && filteredPosts.length === 0 && posts.length > 0 && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No posts match your filters</h3>
              <p>Try adjusting your filters to see more posts</p>
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                style={{ marginTop: '1rem' }}
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && hasMore && filteredPosts.length > 0 && (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <Button variant="secondary" onClick={handleLoadMore}>
                Load More Posts
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {loading && posts.length > 0 && (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          </CardBody>
        </Card>
      )}

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      <button
        className="feed-fab"
        onClick={() => setShowCreatePost(true)}
        aria-label="Create post"
      >
        <HiPlus size={24} />
      </button>
    </div>
  );
};
