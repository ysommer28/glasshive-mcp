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

export function registerSolutionTools(server: McpServer): void {
  server.registerTool(
    "get_solutions",
    {
      description: "List all solutions (products/services) in the GlassHive catalog",
      inputSchema: {
        page: z.number().int().min(0).optional().describe("Page number (0-indexed, default 0)"),
        limit: z.number().int().min(1).max(100).optional().describe("Results per page (default 10, max 100)"),
      },
    },
    async ({ page, limit }) => {
      try {
        const params = new URLSearchParams();
        if (page !== undefined) params.set("page", String(page));
        if (limit) params.set("limit", String(limit));
        const qs = params.toString() ? `?${params}` : "";
        const data = await ghRequest("GET", `/solutions${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_solution",
    {
      description: "Get a single solution by ID",
      inputSchema: {
        id: z.number().int().describe("Solution ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/solutions/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "create_solution",
    {
      description: "Create a new solution (product/service) in GlassHive",
      inputSchema: {
        name: z.string().optional().describe("Solution name"),
        sku: z.string().optional().describe("SKU / product code"),
        description: z.string().optional().describe("Description"),
        url: z.string().optional().describe("Product URL"),
        unitPrice: z.number().optional().describe("Unit price"),
        unitCost: z.number().optional().describe("Unit cost"),
        unitMargin: z.number().optional().describe("Unit margin"),
        billingCycle: z.number().int().optional().describe("Billing cycle"),
      },
    },
    async ({ name, sku, description, url, unitPrice, unitCost, unitMargin, billingCycle }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.Name = name;
        if (sku !== undefined) body.Sku = sku;
        if (description !== undefined) body.Description = description;
        if (url !== undefined) body.Url = url;
        if (unitPrice !== undefined) body.UnitPrice = unitPrice;
        if (unitCost !== undefined) body.UnitCost = unitCost;
        if (unitMargin !== undefined) body.UnitMargin = unitMargin;
        if (billingCycle !== undefined) body.BillingCycle = billingCycle;
        const data = await ghRequest("POST", "/solutions", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_solution",
    {
      description: "Update an existing solution by ID",
      inputSchema: {
        id: z.number().int().describe("Solution ID to update"),
        name: z.string().optional().describe("Solution name"),
        sku: z.string().optional().describe("SKU / product code"),
        description: z.string().optional().describe("Description"),
        url: z.string().optional().describe("Product URL"),
        unitPrice: z.number().optional().describe("Unit price"),
        unitCost: z.number().optional().describe("Unit cost"),
        unitMargin: z.number().optional().describe("Unit margin"),
        billingCycle: z.number().int().optional().describe("Billing cycle"),
      },
    },
    async ({ id, name, sku, description, url, unitPrice, unitCost, unitMargin, billingCycle }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.Name = name;
        if (sku !== undefined) body.Sku = sku;
        if (description !== undefined) body.Description = description;
        if (url !== undefined) body.Url = url;
        if (unitPrice !== undefined) body.UnitPrice = unitPrice;
        if (unitCost !== undefined) body.UnitCost = unitCost;
        if (unitMargin !== undefined) body.UnitMargin = unitMargin;
        if (billingCycle !== undefined) body.BillingCycle = billingCycle;
        const data = await ghRequest("PATCH", `/solutions/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "delete_solution",
    {
      description: "Delete a solution by ID",
      inputSchema: {
        id: z.number().int().describe("Solution ID to delete"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("DELETE", `/solutions/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
