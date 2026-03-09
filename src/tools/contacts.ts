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

export function registerContactTools(server: McpServer): void {
  server.registerTool(
    "get_contacts",
    {
      description: "List contacts in GlassHive with optional pagination",
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
        const data = await ghRequest("GET", `/contacts${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_contact",
    {
      description: "Get a single contact by ID",
      inputSchema: {
        id: z.number().int().describe("Contact ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/contacts/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "create_contact",
    {
      description: "Create a new contact in GlassHive",
      inputSchema: {
        firstName: z.string().describe("First name"),
        lastName: z.string().describe("Last name"),
        email: z.string().email().optional().describe("Email address"),
        title: z.string().optional().describe("Job title"),
        phone: z.string().optional().describe("Phone number"),
        mobilePhone: z.string().optional().describe("Mobile phone number"),
        companyId: z.number().int().optional().describe("ID of the associated company"),
        isSubscribed: z.boolean().optional().describe("Whether the contact is subscribed to marketing"),
        address: z.string().optional().describe("Street address"),
        city: z.string().optional().describe("City"),
        region: z.string().optional().describe("State or region"),
        zipCode: z.string().optional().describe("ZIP or postal code"),
        countryCode: z.string().length(2).optional().describe("Two-letter country code (e.g. US)"),
        linkedinUrl: z.string().url().optional().describe("LinkedIn profile URL"),
      },
    },
    async ({ firstName, lastName, email, title, phone, mobilePhone, companyId, isSubscribed, address, city, region, zipCode, countryCode, linkedinUrl }) => {
      try {
        const body: Record<string, unknown> = {
          FirstName: firstName,
          LastName: lastName,
        };
        if (email !== undefined) body.Email = email;
        if (title !== undefined) body.Title = title;
        if (phone !== undefined) body.Phone = phone;
        if (mobilePhone !== undefined) body.MobilePhone = mobilePhone;
        if (companyId !== undefined) body.CompanyId = companyId;
        if (isSubscribed !== undefined) body.IsSubscribed = isSubscribed;
        if (address !== undefined) body.Address = address;
        if (city !== undefined) body.City = city;
        if (region !== undefined) body.Region = region;
        if (zipCode !== undefined) body.ZipCode = zipCode;
        if (countryCode !== undefined) body.CountryCode = countryCode;
        if (linkedinUrl !== undefined) body.LinkedinUrl = linkedinUrl;
        const data = await ghRequest("POST", "/contacts", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_contact",
    {
      description: "Update an existing contact by ID",
      inputSchema: {
        id: z.number().int().describe("Contact ID to update"),
        firstName: z.string().optional().describe("First name"),
        lastName: z.string().optional().describe("Last name"),
        email: z.string().email().optional().describe("Email address"),
        title: z.string().optional().describe("Job title"),
        phone: z.string().optional().describe("Phone number"),
        mobilePhone: z.string().optional().describe("Mobile phone number"),
        companyId: z.number().int().optional().describe("ID of the associated company"),
        isSubscribed: z.boolean().optional().describe("Whether the contact is subscribed to marketing"),
        linkedinUrl: z.string().url().optional().describe("LinkedIn profile URL"),
      },
    },
    async ({ id, firstName, lastName, email, title, phone, mobilePhone, companyId, isSubscribed, linkedinUrl }) => {
      try {
        const body: Record<string, unknown> = {};
        if (firstName !== undefined) body.FirstName = firstName;
        if (lastName !== undefined) body.LastName = lastName;
        if (email !== undefined) body.Email = email;
        if (title !== undefined) body.Title = title;
        if (phone !== undefined) body.Phone = phone;
        if (mobilePhone !== undefined) body.MobilePhone = mobilePhone;
        if (companyId !== undefined) body.CompanyId = companyId;
        if (isSubscribed !== undefined) body.IsSubscribed = isSubscribed;
        if (linkedinUrl !== undefined) body.LinkedinUrl = linkedinUrl;
        const data = await ghRequest("PATCH", `/contacts/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
