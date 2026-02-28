// src/renderer/components/Landing/DynamicTestimonials.tsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api-client';
import { RatingDisplay } from '../RatingDisplay/RatingDisplay';
import './DynamicTestimonials.css';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  reviewerRole: 'influencer' | 'company';
}

export const DynamicTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/profiles/testimonials?limit=6') as Testimonial[];
        setTestimonials(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load testimonials');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-loading">Loading testimonials...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-error">Unable to load testimonials. Please try again later.</div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // or a fallback message
  }

  return (
    <section className="testimonials-section">
      <h2 className="section-title">What Our Users Say</h2>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t.id} className="testimonial-card">
            <div className="testimonial-header">
              <img
                src={t.reviewerAvatar || '/default-avatar.png'}
                alt={t.reviewerName}
                className="testimonial-avatar"
              />
              <div className="testimonial-info">
                <h4 className="testimonial-name">{t.reviewerName}</h4>
                <span className="testimonial-role">
                  {t.reviewerRole === 'influencer' ? 'Influencer' : 'Brand'}
                </span>
              </div>
            </div>
            <RatingDisplay rating={t.rating} size="small" showValue />
            <p className="testimonial-text">"{t.comment}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};
