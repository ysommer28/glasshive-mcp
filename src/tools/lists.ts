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

export function registerListTools(server: McpServer): void {
  server.registerTool(
    "get_lists",
    {
      description: "List all contact lists in GlassHive. Returns each list's name, contact count, and whether it's marketable.",
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
        const data = await ghRequest("GET", `/lists${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_list",
    {
      description: "Get a single contact list by ID",
      inputSchema: {
        id: z.number().int().describe("List ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/lists/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_list_contacts",
    {
      description: "Get all contacts in a specific contact list",
      inputSchema: {
        id: z.number().int().describe("List ID"),
        page: z.number().int().min(0).optional().describe("Page number (0-indexed, default 0)"),
        limit: z.number().int().min(1).max(100).optional().describe("Results per page (default 10, max 100)"),
      },
    },
    async ({ id, page, limit }) => {
      try {
        const params = new URLSearchParams();
        if (page !== undefined) params.set("page", String(page));
        if (limit) params.set("limit", String(limit));
        const qs = params.toString() ? `?${params}` : "";
        const data = await ghRequest("GET", `/lists/${id}/contacts${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "create_list",
    {
      description: "Create a new contact list in GlassHive",
      inputSchema: {
        name: z.string().describe("List name"),
        isMarketable: z.boolean().optional().describe("Whether this list is used for marketing campaigns"),
      },
    },
    async ({ name, isMarketable }) => {
      try {
        const body: Record<string, unknown> = { Name: name };
        if (isMarketable !== undefined) body.IsMarketable = isMarketable;
        const data = await ghRequest("POST", "/lists", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_list",
    {
      description: "Update an existing contact list by ID",
      inputSchema: {
        id: z.number().int().describe("List ID to update"),
        name: z.string().optional().describe("List name"),
        isMarketable: z.boolean().optional().describe("Whether this list is used for marketing campaigns"),
      },
    },
    async ({ id, name, isMarketable }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.Name = name;
        if (isMarketable !== undefined) body.IsMarketable = isMarketable;
        const data = await ghRequest("PATCH", `/lists/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
