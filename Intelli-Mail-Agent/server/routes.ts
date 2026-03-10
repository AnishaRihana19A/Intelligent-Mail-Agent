import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { registerGoogleRoutes } from "./google/routes";
import { isConnected as isGoogleConnected } from "./google/oauth";

// Mock isAuthenticated middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Attach a placeholder user since we're bypass authentication
  (req as any).user = { claims: { sub: "local_user" } };
  next();
};

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Seed local user for FK constraints
async function seedLocalUser() {
  const existing = await db.select().from(users).where(eq(users.id, "local_user")).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      id: "local_user",
      email: "local@example.com",
      firstName: "Local",
      lastName: "User",
    });
    console.log("Seeded local_user into users table");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication is mocked for local use
  await seedLocalUser();

  // Register Google Drive / Sheets routes
  registerGoogleRoutes(app);

  // Mock auth endpoint so the frontend useAuth hook sees a logged-in user
  app.get("/api/auth/user", (req, res) => {
    res.json({
      id: "local_user",
      email: "local@example.com",
      firstName: "Local",
      lastName: "User",
      profileImageUrl: null,
    });
  });

  app.get(api.templates.list.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      let items = await storage.getTemplates(userId);

      // Seed templates if none exist
      if (items.length === 0) {
        await storage.createTemplate(userId, {
          name: "Formal Intro",
          content: "Dear [Name],\n\nI hope this email finds you well. I am reaching out to introduce our services and discuss how we might be able to help [Company] achieve its goals.\n\nBest regards,\n[Your Name]"
        });
        await storage.createTemplate(userId, {
          name: "Casual Follow-up",
          content: "Hi [Name],\n\nJust wanted to quickly follow up on my previous email. Let me know if you're open to a brief chat this week.\n\nThanks,\n[Your Name]"
        });
        items = await storage.getTemplates(userId);
      }

      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to list templates" });
    }
  });

  app.post(api.templates.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.templates.create.input.parse(req.body);
      const item = await storage.createTemplate(userId, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal Error" });
      }
    }
  });

  app.delete(api.templates.delete.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.deleteTemplate(Number(req.params.id), userId);
    res.status(204).send();
  });

  app.get(api.campaigns.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getCampaigns(userId);
    res.json(items);
  });

  app.get(api.campaigns.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const item = await storage.getCampaign(Number(req.params.id), userId);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post(api.campaigns.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;

      // Coerce templateId if necessary
      const bodySchema = api.campaigns.create.input.extend({
        templateId: z.coerce.number().optional().nullable(),
      });
      const input = bodySchema.parse(req.body);

      const item = await storage.createCampaign(userId, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal Error" });
      }
    }
  });

  app.patch(api.campaigns.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.campaigns.update.input.parse(req.body);
      const item = await storage.updateCampaign(Number(req.params.id), userId, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Error" });
      }
    }
  });

  app.post(api.campaigns.generate.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId, userId);
      if (!campaign) return res.status(404).json({ message: "Not found" });

      let templateContent = "";
      if (campaign.templateId) {
        const templates = await storage.getTemplates(userId);
        const t = templates.find(t => t.id === campaign.templateId);
        if (t) templateContent = t.content;
      }

      // Call OpenAI to generate email
      const prompt = `You are an expert B2B cold email copywriter.
Target Company: ${campaign.targetCompany}
Company Description: ${campaign.companyDescription}
Base Template/Style: ${templateContent || "Professional B2B Intro"}

Instructions:
1. Write a highly personalized, compelling cold email addressing a potential client at this company based on the template.
2. Only output the email body. Do not include any pleasantries or conversational filler like "Here is your email:".
3. Use the structure provided by the template but adapt it to specifically mention the target company's description and value proposition.`;

      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      const generated = response.choices[0]?.message?.content || "";

      const updated = await storage.updateCampaign(campaignId, userId, {
        status: "generated",
        generatedEmail: generated
      });

      res.json(updated);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Generation failed" });
    }
  });

  app.post(api.campaigns.send.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const campaignId = Number(req.params.id);
      const updated = await storage.updateCampaign(campaignId, userId, {
        status: "sent"
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Send failed" });
    }
  });

  app.delete(api.campaigns.delete.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.deleteCampaign(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Connectors — reflect real Google connection status
  app.get(api.connectors.list.path, isAuthenticated, (_req, res) => {
    const googleConnected = isGoogleConnected();
    res.json([
      { id: "gmail", name: "Google Mail", icon: "mail", connected: false },
      { id: "sheets", name: "Google Sheets", icon: "table", connected: googleConnected },
      { id: "drive", name: "Google Drive", icon: "hard-drive", connected: googleConnected },
      { id: "hubspot", name: "HubSpot CRM", icon: "users", connected: false },
    ]);
  });

  return httpServer;
}