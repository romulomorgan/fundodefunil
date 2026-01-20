
export interface Ad {
  id: string;
  platform: 'Facebook' | 'TikTok' | 'Instagram' | 'Google';
  thumbnail: string;
  title: string;
  description: string;
  activeDays: number;
  engagementScore: number;
  estimatedSpend: number;
  category: string;
  cta: string;
  dateStarted: string;
}

export interface FilterState {
  search: string;
  platform: string;
  category: string;
  minDays: number;
}
