/**
 * usePersonalizedContent Hook
 * Returns personalized content based on selected user role
 * Phase 3.2: Personalization
 */

import { useMemo } from 'react';
import { useRole } from '../contexts/RoleContext';
import { personalizedContent, personalizedTestimonials, personalizedStats } from '../data/landing/personalizedContent';

export const usePersonalizedContent = () => {
  const { selectedRole } = useRole();

  const content = useMemo(() => {
    if (selectedRole === 'INFLUENCER') {
      return personalizedContent.INFLUENCER;
    } else if (selectedRole === 'COMPANY') {
      return personalizedContent.COMPANY;
    }
    return personalizedContent.DEFAULT;
  }, [selectedRole]);

  const testimonials = useMemo(() => {
    if (selectedRole === 'INFLUENCER') {
      return personalizedTestimonials.INFLUENCER;
    } else if (selectedRole === 'COMPANY') {
      return personalizedTestimonials.COMPANY;
    }
    // Return mix of both for default
    return [
      ...personalizedTestimonials.INFLUENCER.slice(0, 1),
      ...personalizedTestimonials.COMPANY.slice(0, 1)
    ];
  }, [selectedRole]);

  const stats = useMemo(() => {
    if (selectedRole === 'INFLUENCER') {
      return personalizedStats.INFLUENCER;
    } else if (selectedRole === 'COMPANY') {
      return personalizedStats.COMPANY;
    }
    // Return generic stats for default
    return [
      { label: 'Active Users', value: 17500, suffix: '+' },
      { label: 'Success Rate', value: 93, suffix: '%' },
      { label: 'Avg. ROI', value: 380, suffix: '%' },
      { label: 'Time Saved', value: 12, suffix: 'hrs/week' }
    ];
  }, [selectedRole]);

  return {
    content,
    testimonials,
    stats,
    role: selectedRole
  };
};
