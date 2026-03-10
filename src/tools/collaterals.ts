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

export function registerCollateralTools(server: McpServer): void {
  server.registerTool(
    "get_collaterals",
    {
      description: "List marketing collateral assets in GlassHive",
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
        const data = await ghRequest("GET", `/collaterals${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_collateral",
    {
      description: "Get a single collateral asset by ID",
      inputSchema: {
        id: z.number().int().describe("Collateral ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/collaterals/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
