import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, Bot, MessageCircle, BarChart3, 
  Target, Sparkles, CheckCircle2, Check, ArrowRight,
  Users, Shield, Play
} from 'lucide-react';
import { Auth } from '../Auth';
import { useLandingData } from '../../hooks/useLandingData';
import { useFeaturesData } from '../../hooks/useFeaturesData';
import { 
  AnimatedStatCounter, 
  AnimatedDashboardMockup, 
  StepVideoModal,
  FeatureTabs,
  ComparisonTable,
  LiveActivityFeed,
  RatingWidget,
  LiveUserCounter,
  ROICalculator,
  DynamicTestimonials
} from '../../components/Landing';
import { featureCategories, featureComparison } from '../../data/landing/features';
import { applyLandingSEO, cleanupSEO } from '../../utils/seo';
import { initLazyLoading } from '../../utils/imageOptimization';
import { initPerformanceOptimizations, addResourceHints } from '../../utils/performance';
import './Landing.css'; // Consolidated CSS file

interface LandingProps {
  initialAuthMode?: 'login' | 'register';
}

export const Landing = ({ initialAuthMode }: LandingProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(!!initialAuthMode);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialAuthMode || 'register');
  
  // Use real data from backend
  const { statistics, loading, trackCTAClick } = useLandingData();
  const { metrics: featuresMetrics, loading: featuresLoading } = useFeaturesData();
  
  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Simplified step data (removed details array)
  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Add your niche, platforms, and audience details in minutes',
      estimatedTime: '2-3 min',
      successRate: 98
    },
    {
      number: 2,
      title: 'Get AI-Matched',
      description: 'Our algorithm finds brands that align with your content',
      estimatedTime: 'Instant',
      successRate: 93
    },
    {
      number: 3,
      title: 'Collaborate & Grow',
      description: 'Connect, negotiate, and build successful partnerships',
      estimatedTime: '1-2 weeks',
      successRate: 87
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO and Performance Optimization
  useEffect(() => {
    // Apply SEO meta tags and structured data
    applyLandingSEO();
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Add resource hints
    addResourceHints();
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Cleanup on unmount
    return () => {
      cleanupSEO();
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSignup = (_role: 'INFLUENCER' | 'COMPANY', _source: string) => {
    setAuthMode('register');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleWatchVideo = (stepNumber: number) => {
    setSelectedStep(stepNumber);
    setVideoModalOpen(true);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    // Navigate back to landing page if we came from /login or /register
    if (initialAuthMode) {
      navigate('/', { replace: true });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-gradient">ICMatch</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links desktop-only">
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="nav-link">Testimonials</button>
          </div>
          
          <div className="nav-actions desktop-only">
            <button className="btn-nav-secondary" onClick={handleLogin}>
              Log In
            </button>
            <button className="btn-nav-primary" onClick={() => handleSignup('INFLUENCER', 'nav')}>
              Get Started
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn mobile-only" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button onClick={() => scrollToSection('features')} className="mobile-menu-link">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="mobile-menu-link">How It Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="mobile-menu-link">Testimonials</button>
            <button className="btn-mobile-secondary" onClick={handleLogin}>
              Log In
            </button>
            <button className="btn-mobile-primary" onClick={() => handleSignup('INFLUENCER', 'mobile_nav')}>
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>AI-Powered Matching Platform</span>
            </div>
            <h1 className="hero-title">
              Connect Influencers<br />
              with Brands Through<br />
              <span className="gradient-text">AI-Powered Matching</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands of influencers and companies creating successful collaborations 
              with our intelligent matching platform. Get matched based on niche, audience, 
              and engagement—not guesswork.
            </p>
            <div className="hero-ctas">
              <button 
                className="btn-hero-primary"
                onClick={() => {
                  trackCTAClick('hero_primary', 'influencer');
                  handleSignup('INFLUENCER', 'landing_hero');
                }}
              >
                I'm an Influencer
                <ArrowRight size={20} />
              </button>
              <button 
                className="btn-hero-secondary"
                onClick={() => {
                  trackCTAClick('hero_secondary', 'company');
                  handleSignup('COMPANY', 'landing_hero');
                }}
              >
                I'm a Company
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <Users size={16} />
                <AnimatedStatCounter end={statistics?.totalUsers || 15} suffix="+" /> Active Users
              </div>
              <div className="trust-item">
                <Shield size={16} />
                <span>Verified Profiles</span>
              </div>
              <div className="trust-item">
                <Target size={16} />
                <AnimatedStatCounter end={statistics?.averageMatchScore || 89} suffix="%" /> Success Rate
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <AnimatedDashboardMockup />
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal Clean Cards */}
      <section className="stats-section">
        <div className="stats-container">
          {loading ? (
            <div className="stats-loading">
              <div className="loading-spinner"></div>
              <p>Loading latest statistics...</p>
            </div>
          ) : (
          <div className="stats-grid">
            {[
              {
                value: statistics?.totalUsers || 15,
                label: 'Active Users',
                suffix: '+'
              },
              {
                value: statistics?.successfulCollaborations || 4,
                label: 'Successful Matches',
                suffix: '+'
              },
              {
                value: statistics?.averageMatchScore || 89,
                label: 'AI Accuracy',
                suffix: '%'
              },
              {
                value: statistics?.platformGrowth || 15,
                label: 'Platform Growth',
                suffix: '%'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="stat-card"
              >
                <div className="stat-value">
                  <AnimatedStatCounter 
                    end={stat.value} 
                    suffix={stat.suffix || ''} 
                  />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* How It Works - Clean Three-Column Layout */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get started in minutes and find your perfect match
          </p>
          
          <div className="steps-container-enhanced">
            {steps.map((step) => (
              <div key={step.number} className="step-card-enhanced">
                {/* Step Number Circle */}
                <div className="step-number-circle">
                  {step.number}
                </div>

                {/* Content */}
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>

                {/* Stats Line */}
                <div className="step-stats">
                  <span>{step.estimatedTime}</span>
                  <span className="stat-separator">•</span>
                  <span>{step.successRate}% success</span>
                </div>

                {/* Watch Video Button */}
                <button 
                  className="step-video-btn"
                  onClick={() => handleWatchVideo(step.number)}
                >
                  <Play size={16} />
                  Watch Video
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedStep && (
        <StepVideoModal
          isOpen={videoModalOpen}
          onClose={() => {
            setVideoModalOpen(false);
            setSelectedStep(null);
          }}
          stepNumber={selectedStep}
          stepTitle={steps.find(s => s.number === selectedStep)?.title || ''}
        />
      )}

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose ICMatch?</h2>
          {featuresLoading ? (
            <div className="features-loading">
              <div className="loading-spinner"></div>
              <p>Loading features...</p>
            </div>
          ) : (
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Bot size={28} />
                  </div>
                  <h3 className="feature-title">AI-Powered Matching</h3>
                </div>
                <p className="feature-description">
                  {featuresMetrics?.aiMatching.matchAccuracy || '93%'} accuracy in predicting successful collaborations
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.aiMatching.totalMatches || '12,500+'} matches</span>
                  <span>•</span>
                  <span>{featuresMetrics?.aiMatching.avgMatchTime || '< 1s'} avg time</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="feature-title">Real-Time Messaging</h3>
                </div>
                <p className="feature-description">
                  {featuresMetrics?.communication.totalMessages || '50,000+'} messages sent with {featuresMetrics?.communication.messageDeliveryRate || '99.9%'} delivery rate
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.communication.messagesPerDay || '2,500+'} per day</span>
                  <span>•</span>
                  <span>{featuresMetrics?.communication.avgResponseTime || '< 2h'} response</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <BarChart3 size={28} />
                  </div>
                  <h3 className="feature-title">Analytics Dashboard</h3>
                </div>
                <p className="feature-description">
                  Track {featuresMetrics?.analytics.metricsTracked || '40+'} metrics with {featuresMetrics?.analytics.dataRefreshRate || '5s'} refresh rate
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.analytics.activeCampaigns || '120+'} campaigns</span>
                  <span>•</span>
                  <span>{featuresMetrics?.analytics.totalPosts || '8,500+'} posts</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Target size={28} />
                  </div>
                  <h3 className="feature-title">Campaign Management</h3>
                </div>
                <p className="feature-description">
                  Manage campaigns from start to finish with full automation
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.analytics.activeCampaigns || '120+'} active</span>
                  <span>•</span>
                  <span>{featuresMetrics?.aiMatching.successRate || '87%'} success</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="feature-title">Smart Recommendations</h3>
                </div>
                <p className="feature-description">
                  Get personalized match suggestions with {featuresMetrics?.aiMatching.userSatisfaction || '92%'} satisfaction
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.aiMatching.factorsAnalyzed || '8+'} factors</span>
                  <span>•</span>
                  <span>{featuresMetrics?.aiMatching.avgMatchTime || '< 1s'} instant</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="feature-title">Verified Profiles</h3>
                </div>
                <p className="feature-description">
                  Trust and safety with {featuresMetrics?.analytics.totalUsers || '12,500+'} verified users
                </p>
                <div className="feature-stats-mini">
                  <span>{featuresMetrics?.communication.activeConversations || '1,200+'} active</span>
                  <span>•</span>
                  <span>100% verified</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PHASE 2: Interactive Features Demo */}
      <section id="interactive-features" className="interactive-features-section">
        <div className="section-container">
          <h2 className="section-title">Explore Our Features in Action</h2>
          <p className="section-subtitle">
            See how ICMatch can transform your influencer marketing strategy
          </p>
          {featuresLoading ? (
            <div className="features-loading">
              <div className="loading-spinner"></div>
              <p>Loading features...</p>
            </div>
          ) : (
            <FeatureTabs 
              categories={featureCategories}
              autoRotate={true}
              rotateInterval={5000}
              onTabChange={(tabId) => console.log('Tab changed:', tabId)}
              onDemoClick={(featureId) => console.log('Demo clicked:', featureId)}
              realMetrics={featuresMetrics || undefined}
            />
          )}
        </div>
      </section>

      {/* For Influencers */}
      <section className="for-influencers-section">
        <div className="section-container">
          <div className="content-split">
            <div className="content-visual">
              <div className="visual-placeholder influencer-visual"></div>
            </div>
            <div className="content-text">
              <h2 className="content-title">Built for Influencers</h2>
              <ul className="benefits-list">
                <li><Check size={20} className="check-icon" /> Find brands that match your niche and values</li>
                <li><Check size={20} className="check-icon" /> Get fair compensation based on your audience</li>
                <li><Check size={20} className="check-icon" /> Manage multiple partnerships in one place</li>
                <li><Check size={20} className="check-icon" /> Track your collaboration success rate</li>
                <li><Check size={20} className="check-icon" /> Build long-term brand relationships</li>
                <li><Check size={20} className="check-icon" /> Access exclusive campaign opportunities</li>
              </ul>
              <button 
                className="btn-content-primary"
                onClick={() => handleSignup('INFLUENCER', 'landing_influencers')}
              >
                Start Finding Brand Partners
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="for-companies-section">
        <div className="section-container">
          <div className="content-split">
            <div className="content-text">
              <h2 className="content-title">Grow Your Company with Authentic Voices</h2>
              <ul className="benefits-list">
                <li><Check size={20} className="check-icon" /> Discover influencers who align with your brand</li>
                <li><Check size={20} className="check-icon" /> AI-powered matching saves time and resources</li>
                <li><Check size={20} className="check-icon" /> Manage campaigns from brief to delivery</li>
                <li><Check size={20} className="check-icon" /> Track ROI with built-in analytics</li>
                <li><Check size={20} className="check-icon" /> Build a network of trusted creators</li>
                <li><Check size={20} className="check-icon" /> Scale your influencer marketing efforts</li>
              </ul>
              <button 
                className="btn-content-primary"
                onClick={() => handleSignup('COMPANY', 'landing_companies')}
              >
                Find Your Influencers
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="content-visual">
              <div className="visual-placeholder company-visual"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 2: Social Proof */}
      <section className="social-proof-section">
        <div className="section-container">
          <h2 className="section-title">Join Thousands of Success Stories</h2>
          <p className="section-subtitle">
            See real-time activity and trusted ratings from our community
          </p>
          <div className="social-proof-grid">
            <LiveActivityFeed maxItems={5} updateInterval={4000} />
            <RatingWidget />
            <LiveUserCounter />
          </div>
        </div>
      </section>

      {/* PHASE 2.3: ROI Calculator */}
      <section className="roi-calculator-section">
        <div className="section-container">
          <ROICalculator
            onSignupClick={() => handleSignup('INFLUENCER', 'roi_calculator')}
            showFullResults={false}
          />
        </div>
      </section>

      {/* PHASE 2: Feature Comparison */}
      <section className="comparison-section">
        <div className="section-container">
          <h2 className="section-title">See How We Compare</h2>
          <p className="section-subtitle">
            ICMatch offers more features and better value than other platforms
          </p>
          <ComparisonTable 
            features={featureComparison}
            onSignupClick={() => handleSignup('INFLUENCER', 'comparison_table')}
          />
        </div>
      </section>

      {/* Dynamic Testimonials - Fetched from Database */}
      <section id="testimonials" className="landing-testimonials">
        <DynamicTestimonials />
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {[
              {
                question: 'How does the AI matching work?',
                answer: 'Our AI analyzes 8+ factors including niche alignment, audience match, and engagement rate to predict collaboration success with 93% accuracy.'
              },
              {
                question: 'Is it free to join?',
                answer: 'Yes! Creating a profile and browsing matches is completely free. Premium features are available for advanced users.'
              },
              {
                question: 'How long does it take to find matches?',
                answer: 'Instantly! As soon as you complete your profile, you\'ll see potential matches ranked by compatibility.'
              },
              {
                question: 'Can I message potential partners?',
                answer: 'Yes, our real-time messaging system lets you connect with matches instantly.'
              }
            ].map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    className={`faq-icon ${expandedFaq === index ? 'expanded' : ''}`}
                    size={20}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Find Your Perfect Match?</h2>
          <p className="cta-subtitle">
            Join thousands of influencers and companies creating successful collaborations
          </p>
          <div className="cta-buttons">
            <button 
              className="btn-cta-primary"
              onClick={() => handleSignup('INFLUENCER', 'landing_final')}
            >
              Sign Up as Influencer
            </button>
            <button 
              className="btn-cta-secondary"
              onClick={() => handleSignup('COMPANY', 'landing_final')}
            >
              Sign Up as Company
            </button>
          </div>
          <p className="cta-note">Free to join • No credit card required • Get matched in minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4 className="footer-heading">Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <a href="#about">About Us</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Resources</h4>
              <a href="#help">Help Center</a>
              <a href="#community">Community</a>
              <a href="#status">Status</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 ICMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Auth Modal */}
      {authModalOpen && (
        <Auth
          asModal={true}
          isOpen={authModalOpen}
          onClose={handleCloseAuthModal}
          initialMode={authMode}
        />
      )}
    </div>
  );
};


