import { z } from 'zod';

export const careerPathSchema = z.object({
  paths: z.array(z.object({
    role: z.string().describe('Target role title'),
    description: z.string().describe('Brief description of the role'),
    fitScore: z.number().min(0).max(100).describe('How well the candidate fits (0-100)'),
    salaryRange: z.string().describe('Estimated salary range'),
    timelineMonths: z.number().describe('Estimated months to transition'),
    requiredSkills: z.array(z.string()).describe('Skills needed for this role'),
    currentSkillsMatch: z.array(z.string()).describe('Skills the candidate already has'),
    actionSteps: z.array(z.string()).describe('Concrete steps to take'),
  })).min(2).max(3),
});

export const interviewQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(['behavioral', 'technical', 'situational', 'case-study']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    answerGuide: z.string().describe('Key points to mention in the answer'),
    starFramework: z.object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    }).optional().describe('STAR framework for behavioral questions'),
  })).min(8).max(15),
});

export type CareerPath = z.infer<typeof careerPathSchema>;
export type InterviewQuestions = z.infer<typeof interviewQuestionsSchema>;
