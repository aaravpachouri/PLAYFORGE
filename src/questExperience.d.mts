export type QuestCategory = 'Focus' | 'Discipline' | 'Exploration';
export interface DailyLifeQuest {
  id: string;
  category: QuestCategory;
  title: string;
  description: string;
  duration: number;
  type: string;
  icon: string;
  tag: string;
  activity: 'Other';
  xp: number;
  subtitle: string;
}
export function buildDailyLifeQuests(options: { date: string; minutes: number; goal?: string; level?: string }): DailyLifeQuest[];
export function getQuestAcknowledgement(category: QuestCategory, note?: string): string;
export function getCheckinReflection(options?: { energy?: number | null; mood?: string }): string;
