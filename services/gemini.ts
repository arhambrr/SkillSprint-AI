import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerIntent, Project, SkillRecommendation } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_FAST = 'gemini-2.5-flash';

// Helper to ensure JSON response
const jsonConfig = (schema: Schema) => ({
  responseMimeType: "application/json",
  responseSchema: schema,
});

export const GeminiService = {
  async analyzeProfile(resumeText: string, intent: CareerIntent) {
    const prompt = `
      Analyze this professional profile text for a user whose career intent is "${intent}".
      Extract their current top 5 skills and suggest a general recommended career path in 1 short sentence.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        currentSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendedPath: { type: Type.STRING },
      },
      required: ["currentSkills", "recommendedPath"],
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [{ text: prompt }, { text: `PROFILE TEXT:\n${resumeText}` }]
      },
      config: jsonConfig(schema),
    });

    return JSON.parse(response.text);
  },

  async getSkillRecommendations(currentSkills: string[], intent: CareerIntent, path: string): Promise<SkillRecommendation[]> {
    const prompt = `
      Given a user with current skills: [${currentSkills.join(', ')}], aiming to "${intent}" in a path like "${path}".
      Recommend exactly 3 distinct, high-impact, modern skills they should learn next in a 14-day sprint.
      They should be beginner-friendly enough to start, but deep enough to master later.
    `;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the skill (e.g., React, Python Data Analysis, Public Speaking)" },
                rationale: { type: Type.STRING, description: "Why this is a good fit in 1 sentence" },
                category: { type: Type.STRING, description: "Tech, Soft Skill, Design, or Business" },
            },
            required: ["name", "rationale", "category"]
        }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: jsonConfig(schema),
    });

    const rawdata = JSON.parse(response.text);
    const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-amber-500'];

    // Add IDs and UI colors
    return rawdata.map((item: any, index: number) => ({
        ...item,
        id: `skill-${index}`,
        color: colors[index % colors.length]
    }));
  },

  async generateSprintProjects(skill: string): Promise<Project[]> {
    const prompt = `
      Create a 14-day learning sprint for the skill: "${skill}".
      Generate exactly 3 mini-projects that increase in difficulty.
      Project 1 is due Day 3 (Easy), Project 2 due Day 8 (Medium), Project 3 due Day 14 (Hard).
      Ensure deliverables can be submitted as text (e.g., code snippets, short essays, links to designs).
    `;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING, description: "Clear instructions on what to do. Max 3 sentences." },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                deliverableType: { type: Type.STRING, description: "e.g., Code snippet, 300-word reflection, Link" },
                dayDue: { type: Type.INTEGER }
            },
            required: ["title", "description", "difficulty", "deliverableType", "dayDue"]
        }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: jsonConfig(schema),
    });

    const rawData = JSON.parse(response.text);
    return rawData.map((proj: any, idx: number) => ({
        ...proj,
        id: idx + 1,
        status: idx === 0 ? 'active' : 'locked'
    }));
  },

  async scoreSubmission(project: Project, submission: string, skill: string) {
    const prompt = `
      Act as an expert mentor in ${skill}. Grade this student submission.
      Project Goal: ${project.description}
      Student Submission: "${submission}"

      Be encouraging but fair. If it's gibberish, give a low score.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score from 0 to 100" },
        feedback: { type: Type.STRING, description: "2-3 sentences of constructive feedback." },
      },
      required: ["score", "feedback"],
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: jsonConfig(schema),
    });

    return JSON.parse(response.text);
  }
};
