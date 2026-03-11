import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghRequest, GlassHiveError } from "../client.js";
import { cacheContact, searchContacts } from "../cache.js";

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
        const data = await ghRequest<{ data?: { Id?: number } }>("POST", "/contacts", body);
        // Cache the new contact so it can be found by name/email later
        const newId = data?.data?.Id;
        if (newId) {
          cacheContact({ id: newId, firstName, lastName, email, companyId });
        }
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

  server.registerTool(
    "get_contact_opportunities",
    {
      description: "Get all opportunities associated with a contact",
      inputSchema: {
        id: z.number().int().describe("Contact ID"),
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
        const data = await ghRequest("GET", `/contacts/${id}/opportunities${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "delete_contact",
    {
      description: "Delete a contact by ID",
      inputSchema: {
        id: z.number().int().describe("Contact ID to delete"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("DELETE", `/contacts/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_contact_lists",
    {
      description: "Get all contact lists that a contact belongs to",
      inputSchema: {
        id: z.number().int().describe("Contact ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/contacts/${id}/lists`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "add_contact_to_lists",
    {
      description: "Add a contact to one or more contact lists",
      inputSchema: {
        id: z.number().int().describe("Contact ID"),
        listIds: z.array(z.number().int()).min(1).describe("Array of list IDs to add the contact to"),
      },
    },
    async ({ id, listIds }) => {
      try {
        const data = await ghRequest("PUT", `/contacts/${id}/lists`, { listIds });
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "remove_contact_from_list",
    {
      description: "Remove a contact from a specific contact list",
      inputSchema: {
        id: z.number().int().describe("Contact ID"),
        listId: z.number().int().describe("List ID to remove the contact from"),
      },
    },
    async ({ id, listId }) => {
      try {
        const data = await ghRequest("DELETE", `/contacts/${id}/lists/${listId}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "search_contacts",
    {
      description:
        "Search for contacts by name, email, or company using the local cache. " +
        "IMPORTANT: The GlassHive API returns only IDs — this cache is the only way to look up contacts by name/email. " +
        "Contacts are added to the cache when created via create_contact or registered via register_contact. " +
        "If a contact is not found, ask the user for their ID and use register_contact to add them.",
      inputSchema: {
        query: z.string().min(1).describe("Name, email, or company name to search for (case-insensitive substring match)"),
      },
    },
    async ({ query }) => {
      const results = searchContacts(query);
      if (results.length === 0) {
        return ok({
          message: `No contacts found matching "${query}" in local cache. If you know their GlassHive ID, use register_contact to add them.`,
          results: [],
        });
      }
      return ok({ count: results.length, results });
    }
  );

  server.registerTool(
    "register_contact",
    {
      description:
        "Manually register an existing GlassHive contact in the local search cache. " +
        "Use this for contacts that existed before this MCP was set up. " +
        "After registering, the contact can be found via search_contacts.",
      inputSchema: {
        id: z.number().int().describe("Contact ID (from GlassHive)"),
        firstName: z.string().describe("First name"),
        lastName: z.string().describe("Last name"),
        email: z.string().email().optional().describe("Email address"),
        companyId: z.number().int().optional().describe("Company ID"),
        companyName: z.string().optional().describe("Company name (for display/search)"),
      },
    },
    async ({ id, firstName, lastName, email, companyId, companyName }) => {
      cacheContact({ id, firstName, lastName, email, companyId, companyName });
      return ok({ message: `Contact ${firstName} ${lastName} (ID: ${id}) registered in local cache.` });
    }
  );
}
