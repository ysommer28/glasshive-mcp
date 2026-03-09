import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghRequest, GlassHiveError } from "../client.js";

function ok(data: unknown): { content: [{ type: "text"; text: string }] } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function err(e: unknown): { content: [{ type: "text"; text: string }] } {
  const msg = e instanceof GlassHiveError
    ? `GlassHive error ${e.status}: ${e.message}`
    : e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text", text: msg }] };
}

export function registerOpportunityTools(server: McpServer): void {
  server.registerTool(
    "get_opportunities",
    {
      description: "List opportunities in GlassHive with optional pagination",
      inputSchema: {
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        limit: z.number().int().min(1).max(100).optional().describe("Results per page (default 10, max 100)"),
      },
    },
    async ({ page, limit }) => {
      try {
        const params = new URLSearchParams();
        if (page) params.set("page", String(page));
        if (limit) params.set("limit", String(limit));
        const qs = params.toString() ? `?${params}` : "";
        const data = await ghRequest("GET", `/opportunities${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_opportunity",
    {
      description: "Get a single opportunity by ID",
      inputSchema: {
        id: z.number().int().describe("Opportunity ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/opportunities/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "create_opportunity",
    {
      description: "Create a new opportunity (deal) in GlassHive",
      inputSchema: {
        name: z.string().describe("Opportunity name"),
        contactId: z.number().int().optional().describe("ID of the associated contact"),
        companyId: z.number().int().optional().describe("ID of the associated company"),
        price: z.number().optional().describe("Deal value / price"),
        description: z.string().optional().describe("Opportunity description"),
        dealTypeId: z.number().int().optional().describe("Deal type ID"),
        dealStatusId: z.number().int().optional().describe("Deal status ID"),
        priceTypeId: z.number().int().optional().describe("Price type ID (e.g. 1 = one-time, 2 = recurring)"),
        duration: z.number().int().optional().describe("Duration in days"),
        closeDate: z.string().optional().describe("Expected close date (ISO 8601, e.g. 2026-06-30)"),
      },
    },
    async ({ name, contactId, companyId, price, description, dealTypeId, dealStatusId, priceTypeId, duration, closeDate }) => {
      try {
        const body: Record<string, unknown> = { Name: name };
        if (contactId !== undefined) body.ContactId = contactId;
        if (companyId !== undefined) body.CompanyId = companyId;
        if (price !== undefined) body.Price = price;
        if (description !== undefined) body.Description = description;
        if (dealTypeId !== undefined) body.DealTypeId = dealTypeId;
        if (dealStatusId !== undefined) body.DealStatusId = dealStatusId;
        if (priceTypeId !== undefined) body.PriceTypeId = priceTypeId;
        if (duration !== undefined) body.Duration = duration;
        if (closeDate !== undefined) body.CloseDate = closeDate;
        const data = await ghRequest("POST", "/opportunities", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_opportunity",
    {
      description: "Update an existing opportunity by ID",
      inputSchema: {
        id: z.number().int().describe("Opportunity ID to update"),
        name: z.string().optional().describe("Opportunity name"),
        contactId: z.number().int().optional().describe("ID of the associated contact"),
        companyId: z.number().int().optional().describe("ID of the associated company"),
        price: z.number().optional().describe("Deal value / price"),
        description: z.string().optional().describe("Opportunity description"),
        dealTypeId: z.number().int().optional().describe("Deal type ID"),
        dealStatusId: z.number().int().optional().describe("Deal status ID"),
        priceTypeId: z.number().int().optional().describe("Price type ID"),
        duration: z.number().int().optional().describe("Duration in days"),
        closeDate: z.string().optional().describe("Expected close date (ISO 8601)"),
      },
    },
    async ({ id, name, contactId, companyId, price, description, dealTypeId, dealStatusId, priceTypeId, duration, closeDate }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.Name = name;
        if (contactId !== undefined) body.ContactId = contactId;
        if (companyId !== undefined) body.CompanyId = companyId;
        if (price !== undefined) body.Price = price;
        if (description !== undefined) body.Description = description;
        if (dealTypeId !== undefined) body.DealTypeId = dealTypeId;
        if (dealStatusId !== undefined) body.DealStatusId = dealStatusId;
        if (priceTypeId !== undefined) body.PriceTypeId = priceTypeId;
        if (duration !== undefined) body.Duration = duration;
        if (closeDate !== undefined) body.CloseDate = closeDate;
        const data = await ghRequest("PATCH", `/opportunities/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
