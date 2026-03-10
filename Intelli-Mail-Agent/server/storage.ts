import { db } from "./db";
import { 
  templates, campaigns, 
  type Template, type InsertTemplate, 
  type Campaign, type InsertCampaign, type UpdateCampaignRequest 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getTemplates(userId: string): Promise<Template[]>;
  createTemplate(userId: string, template: Omit<InsertTemplate, "userId">): Promise<Template>;
  deleteTemplate(id: number, userId: string): Promise<void>;
  
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: number, userId: string): Promise<Campaign | undefined>;
  createCampaign(userId: string, campaign: Omit<InsertCampaign, "userId">): Promise<Campaign>;
  updateCampaign(id: number, userId: string, updates: UpdateCampaignRequest): Promise<Campaign>;
  deleteCampaign(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTemplates(userId: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.userId, userId));
  }
  async createTemplate(userId: string, template: Omit<InsertTemplate, "userId">): Promise<Template> {
    const [t] = await db.insert(templates).values({ ...template, userId }).returning();
    return t;
  }
  async deleteTemplate(id: number, userId: string): Promise<void> {
    await db.delete(templates).where(and(eq(templates.id, id), eq(templates.userId, userId)));
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  }
  async getCampaign(id: number, userId: string): Promise<Campaign | undefined> {
    const [c] = await db.select().from(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return c;
  }
  async createCampaign(userId: string, campaign: Omit<InsertCampaign, "userId">): Promise<Campaign> {
    const [c] = await db.insert(campaigns).values({ ...campaign, userId }).returning();
    return c;
  }
  async updateCampaign(id: number, userId: string, updates: UpdateCampaignRequest): Promise<Campaign> {
    const [c] = await db.update(campaigns).set(updates).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId))).returning();
    return c;
  }
  async deleteCampaign(id: number, userId: string): Promise<void> {
    await db.delete(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
  }
}

export const storage = new DatabaseStorage();