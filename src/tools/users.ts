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

export function registerUserTools(server: McpServer): void {
  server.registerTool(
    "get_users",
    {
      description: "List all users in GlassHive",
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
        const data = await ghRequest("GET", `/users${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_user",
    {
      description: "Get a single user by UUID",
      inputSchema: {
        uuid: z.string().uuid().describe("User UUID"),
      },
    },
    async ({ uuid }) => {
      try {
        const data = await ghRequest("GET", `/users/${uuid}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_user",
    {
      description: "Update a user's profile and quota settings",
      inputSchema: {
        uuid: z.string().uuid().describe("User UUID to update"),
        firstName: z.string().optional().describe("First name"),
        lastName: z.string().optional().describe("Last name"),
        title: z.string().optional().describe("Job title"),
        profileImageUrl: z.string().optional().describe("Profile image URL"),
        birthdate: z.string().optional().describe("Birthdate (ISO 8601)"),
        yearsOfExperience: z.number().optional().describe("Years of experience"),
        linkedinUrl: z.string().optional().describe("LinkedIn profile URL"),
        monthlyRevenueQuota: z.number().optional().describe("Monthly revenue quota"),
        monthlyMrrQuota: z.number().optional().describe("Monthly MRR quota"),
        monthlyMarginQuota: z.number().optional().describe("Monthly margin quota"),
        callQuota: z.number().optional().describe("Call quota"),
        emailQuota: z.number().optional().describe("Email quota"),
        meetingQuota: z.number().optional().describe("Meeting quota"),
        opportunityQuota: z.number().optional().describe("Opportunity quota"),
        winQuota: z.number().optional().describe("Win quota"),
      },
    },
    async ({ uuid, firstName, lastName, title, profileImageUrl, birthdate, yearsOfExperience, linkedinUrl, monthlyRevenueQuota, monthlyMrrQuota, monthlyMarginQuota, callQuota, emailQuota, meetingQuota, opportunityQuota, winQuota }) => {
      try {
        const body: Record<string, unknown> = {};
        if (firstName !== undefined) body.FirstName = firstName;
        if (lastName !== undefined) body.LastName = lastName;
        if (title !== undefined) body.Title = title;
        if (profileImageUrl !== undefined) body.ProfileImageUrl = profileImageUrl;
        if (birthdate !== undefined) body.Birthdate = birthdate;
        if (yearsOfExperience !== undefined) body.YearsOfExperience = yearsOfExperience;
        if (linkedinUrl !== undefined) body.LinkedinUrl = linkedinUrl;
        if (monthlyRevenueQuota !== undefined) body.MonthlyRevenueQuota = monthlyRevenueQuota;
        if (monthlyMrrQuota !== undefined) body.MonthlyMrrQuota = monthlyMrrQuota;
        if (monthlyMarginQuota !== undefined) body.MonthlyMarginQuota = monthlyMarginQuota;
        if (callQuota !== undefined) body.CallQuota = callQuota;
        if (emailQuota !== undefined) body.EmailQuota = emailQuota;
        if (meetingQuota !== undefined) body.MeetingQuota = meetingQuota;
        if (opportunityQuota !== undefined) body.OpportunityQuota = opportunityQuota;
        if (winQuota !== undefined) body.WinQuota = winQuota;
        const data = await ghRequest("PATCH", `/users/${uuid}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_accounts",
    {
      description: "List all partner accounts in GlassHive",
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
        const data = await ghRequest("GET", `/accounts${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
