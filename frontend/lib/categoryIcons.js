import {
  LayoutGrid,
  Car,
  Baby,
  Sparkles,
  Shirt,
  Pizza,
  HeartPulse,
  BookOpen,
  Film,
  Music,
  Home,
  Gamepad2,
  Briefcase,
  Cpu,
  MoreHorizontal,
} from 'lucide-react';

const iconMap = {
  automotive: Car,
  'baby-kids': Baby,
  beauty: Sparkles,
  fashion: Shirt,
  food: Pizza,
  'health-wellness': HeartPulse,
  ebooks: BookOpen,
  movies: Film,
  music: Music,
  'home-living': Home,
  'toys-games': Gamepad2,
  'office-stationery': Briefcase,
  tech: Cpu,
  software: Cpu,
};

export function iconForCategory(slug) {
  return iconMap[slug] || MoreHorizontal;
}

export { LayoutGrid, MoreHorizontal };
