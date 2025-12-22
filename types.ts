export type Platform = 'all' | 'facebook' | 'instagram' | 'tiktok' | 'google' | 'youtube';

export interface Lead {
  id: string;
  name: string;
  email: string;
  platform: Platform;
  timestamp: Date;
  value: number;
  status: 'new' | 'contacted' | 'converted';
}

export interface Metric {
  name: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface PlatformData {
  id: Platform;
  name: string;
  color: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  roi: number;
}

export interface ChartDataPoint {
  time: string;
  facebook: number;
  instagram: number;
  tiktok: number;
  google: number;
  youtube: number;
  total: number;
}