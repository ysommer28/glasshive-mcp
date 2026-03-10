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

export function registerActivityTools(server: McpServer): void {
  server.registerTool(
    "get_activities",
    {
      description: "List all activities in GlassHive with optional pagination",
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
        const data = await ghRequest("GET", `/activities${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_activity",
    {
      description: "Get a single activity by ID",
      inputSchema: {
        id: z.number().int().describe("Activity ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/activities/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_meetings",
    {
      description: "List all meeting activities in GlassHive",
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
        const data = await ghRequest("GET", `/activities/meetings${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "log_call",
    {
      description: "Log a call activity for a contact",
      inputSchema: {
        contactId: z.number().int().describe("Contact ID the call was with"),
        userId: z.number().int().describe("User ID who made the call"),
        details: z.string().optional().describe("Call notes / details"),
        activityDate: z.string().optional().describe("Date/time of the call (ISO 8601)"),
        isPinned: z.boolean().optional().describe("Pin this activity to the top"),
      },
    },
    async ({ contactId, userId, details, activityDate, isPinned }) => {
      try {
        const body: Record<string, unknown> = { ContactId: contactId, UserId: userId };
        if (details !== undefined) body.Details = details;
        if (activityDate !== undefined) body.ActivityDate = activityDate;
        if (isPinned !== undefined) body.IsPinned = isPinned;
        const data = await ghRequest("POST", "/activities/call", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "log_email",
    {
      description: "Log an email activity for a contact",
      inputSchema: {
        contactId: z.number().int().describe("Contact ID the email was sent to/from"),
        userId: z.number().int().describe("User ID who sent the email"),
        details: z.string().optional().describe("Email notes / details"),
        activityDate: z.string().optional().describe("Date/time of the email (ISO 8601)"),
        isPinned: z.boolean().optional().describe("Pin this activity to the top"),
      },
    },
    async ({ contactId, userId, details, activityDate, isPinned }) => {
      try {
        const body: Record<string, unknown> = { ContactId: contactId, UserId: userId };
        if (details !== undefined) body.Details = details;
        if (activityDate !== undefined) body.ActivityDate = activityDate;
        if (isPinned !== undefined) body.IsPinned = isPinned;
        const data = await ghRequest("POST", "/activities/email", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "log_note",
    {
      description: "Log a note activity for a contact",
      inputSchema: {
        contactId: z.number().int().describe("Contact ID the note is about"),
        userId: z.number().int().describe("User ID who wrote the note"),
        details: z.string().optional().describe("Note content"),
        activityDate: z.string().optional().describe("Date/time of the note (ISO 8601)"),
        isPinned: z.boolean().optional().describe("Pin this activity to the top"),
      },
    },
    async ({ contactId, userId, details, activityDate, isPinned }) => {
      try {
        const body: Record<string, unknown> = { ContactId: contactId, UserId: userId };
        if (details !== undefined) body.Details = details;
        if (activityDate !== undefined) body.ActivityDate = activityDate;
        if (isPinned !== undefined) body.IsPinned = isPinned;
        const data = await ghRequest("POST", "/activities/note", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "log_meeting",
    {
      description: "Log a meeting activity for one or more contacts",
      inputSchema: {
        contactIds: z.array(z.number().int()).min(1).describe("Contact IDs who attended the meeting"),
        userIds: z.array(z.string()).min(1).describe("User UUIDs who attended the meeting"),
        details: z.string().describe("Meeting notes / agenda"),
        meetingStatus: z.enum(["Tentative", "Confirmed", "Cancelled"]).describe("Meeting status"),
        meetingSubject: z.string().optional().describe("Meeting subject / title"),
        meetingLocation: z.string().optional().describe("Meeting location"),
        meetingDuration: z.number().optional().describe("Duration in seconds"),
        activityDate: z.string().optional().describe("Date/time of the meeting (ISO 8601)"),
        isPinned: z.boolean().optional().describe("Pin this activity to the top"),
      },
    },
    async ({ contactIds, userIds, details, meetingStatus, meetingSubject, meetingLocation, meetingDuration, activityDate, isPinned }) => {
      try {
        const body: Record<string, unknown> = {
          ContactIds: contactIds,
          UserIds: userIds,
          Details: details,
          MeetingStatus: meetingStatus,
        };
        if (meetingSubject !== undefined) body.MeetingSubject = meetingSubject;
        if (meetingLocation !== undefined) body.MeetingLocation = meetingLocation;
        if (meetingDuration !== undefined) body.MeetingDuration = meetingDuration;
        if (activityDate !== undefined) body.ActivityDate = activityDate;
        if (isPinned !== undefined) body.IsPinned = isPinned;
        const data = await ghRequest("POST", "/activities/meeting", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_activity",
    {
      description: "Update an existing activity by ID",
      inputSchema: {
        id: z.number().int().describe("Activity ID to update"),
        details: z.string().optional().describe("Notes / details"),
        activityDate: z.string().optional().describe("Date/time of the activity (ISO 8601)"),
        isPinned: z.boolean().optional().describe("Pin this activity to the top"),
        meetingSubject: z.string().optional().describe("Meeting subject (meetings only)"),
        meetingLocation: z.string().optional().describe("Meeting location (meetings only)"),
        meetingStatus: z.enum(["Tentative", "Confirmed", "Cancelled"]).optional().describe("Meeting status (meetings only)"),
        meetingDuration: z.number().optional().describe("Duration in seconds (meetings only)"),
      },
    },
    async ({ id, details, activityDate, isPinned, meetingSubject, meetingLocation, meetingStatus, meetingDuration }) => {
      try {
        const body: Record<string, unknown> = {};
        if (details !== undefined) body.Details = details;
        if (activityDate !== undefined) body.ActivityDate = activityDate;
        if (isPinned !== undefined) body.IsPinned = isPinned;
        if (meetingSubject !== undefined) body.MeetingSubject = meetingSubject;
        if (meetingLocation !== undefined) body.MeetingLocation = meetingLocation;
        if (meetingStatus !== undefined) body.MeetingStatus = meetingStatus;
        if (meetingDuration !== undefined) body.MeetingDuration = meetingDuration;
        const data = await ghRequest("PATCH", `/activities/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "delete_activity",
    {
      description: "Delete an activity by ID",
      inputSchema: {
        id: z.number().int().describe("Activity ID to delete"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("DELETE", `/activities/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
