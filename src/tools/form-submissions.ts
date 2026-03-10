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

export function registerFormSubmissionTools(server: McpServer): void {
  server.registerTool(
    "get_form_submissions",
    {
      description: "List inbound form submissions / leads in GlassHive",
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
        const data = await ghRequest("GET", `/form-submissions${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_form_submission",
    {
      description: "Get a single form submission by ID",
      inputSchema: {
        id: z.number().int().describe("Form submission ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/form-submissions/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
