export enum AppView {
  ONBOARDING = 'ONBOARDING',
  ANALYSIS = 'ANALYSIS',
  ROULETTE = 'ROULETTE',
  DASHBOARD = 'DASHBOARD',
  PROJECT_DETAILS = 'PROJECT_DETAILS',
  SPRINT_SUMMARY = 'SPRINT_SUMMARY',
  PREMIUM_GATE = 'PREMIUM_GATE'
}

export enum CareerIntent {
  ADVANCE = 'Advance in current role',
  TRANSITION = 'Transition to new career',
  EXPLORE = 'Just exploring'
}

export interface UserProfile {
  name: string;
  resumeText: string;
  intent: CareerIntent | null;
  currentSkills: string[];
  recommendedPath: string;
}

export interface SkillRecommendation {
  id: string;
  name: string;
  rationale: string;
  category: string;
  color: string; // For UI
}

export interface Project {
  id: number;
  dayDue: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deliverableType: string;
  status: 'locked' | 'active' | 'submitted' | 'graded';
  userSubmission?: string;
  score?: number;
  feedback?: string;
}

export interface SprintState {
  skill: SkillRecommendation | null;
  rivalName: string;
  rivalScore: number;
  userScore: number;
  currentDay: number;
  projects: Project[];
  isWinner?: boolean;
}
