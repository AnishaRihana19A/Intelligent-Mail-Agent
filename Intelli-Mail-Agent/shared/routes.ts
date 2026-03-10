import { z } from 'zod';
import { insertTemplateSchema, insertCampaignSchema, templates, campaigns } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  templates: {
    list: {
      method: 'GET' as const,
      path: '/api/templates' as const,
      responses: {
        200: z.array(z.custom<typeof templates.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/templates' as const,
      input: insertTemplateSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof templates.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/templates/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns' as const,
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns' as const,
      input: insertCampaignSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/campaigns/:id' as const,
      input: z.object({ generatedEmail: z.string() }),
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    generate: {
      method: 'POST' as const,
      path: '/api/campaigns/:id/generate' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/campaigns/:id/send' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/campaigns/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  },
  connectors: {
    list: {
      method: 'GET' as const,
      path: '/api/connectors' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string(),
          connected: z.boolean(),
        })),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
