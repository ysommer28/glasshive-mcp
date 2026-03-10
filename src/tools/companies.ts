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

export function registerCompanyTools(server: McpServer): void {
  server.registerTool(
    "get_companies",
    {
      description: "List companies in GlassHive with optional pagination",
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
        const data = await ghRequest("GET", `/companies${qs}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "get_company",
    {
      description: "Get a single company by ID",
      inputSchema: {
        id: z.number().int().describe("Company ID"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("GET", `/companies/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "create_company",
    {
      description: "Create a new company in GlassHive",
      inputSchema: {
        name: z.string().describe("Company name"),
        website: z.string().url().optional().describe("Company website URL"),
        phone: z.string().optional().describe("Main phone number"),
        email: z.string().email().optional().describe("Company email"),
        address: z.string().optional().describe("Street address"),
        city: z.string().optional().describe("City"),
        region: z.string().optional().describe("State or region"),
        zipCode: z.string().optional().describe("ZIP or postal code"),
        countryCode: z.string().length(2).optional().describe("Two-letter country code (e.g. US)"),
        description: z.string().optional().describe("Company description"),
        isAccount: z.boolean().optional().describe("Whether this is a managed account"),
        employeeCount: z.number().int().optional().describe("Number of employees"),
        deviceCount: z.number().int().optional().describe("Number of devices"),
      },
    },
    async ({ name, website, phone, email, address, city, region, zipCode, countryCode, description, isAccount, employeeCount, deviceCount }) => {
      try {
        const body: Record<string, unknown> = { Name: name };
        if (website !== undefined) body.Website = website;
        if (phone !== undefined) body.Phone = phone;
        if (email !== undefined) body.Email = email;
        if (address !== undefined) body.Address = address;
        if (city !== undefined) body.City = city;
        if (region !== undefined) body.Region = region;
        if (zipCode !== undefined) body.ZipCode = zipCode;
        if (countryCode !== undefined) body.CountryCode = countryCode;
        if (description !== undefined) body.Description = description;
        if (isAccount !== undefined) body.IsAccount = isAccount;
        if (employeeCount !== undefined) body.EmployeeCount = employeeCount;
        if (deviceCount !== undefined) body.DeviceCount = deviceCount;
        const data = await ghRequest("POST", "/companies", body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "update_company",
    {
      description: "Update an existing company by ID",
      inputSchema: {
        id: z.number().int().describe("Company ID to update"),
        name: z.string().optional().describe("Company name"),
        website: z.string().url().optional().describe("Company website URL"),
        phone: z.string().optional().describe("Main phone number"),
        email: z.string().email().optional().describe("Company email"),
        address: z.string().optional().describe("Street address"),
        city: z.string().optional().describe("City"),
        region: z.string().optional().describe("State or region"),
        zipCode: z.string().optional().describe("ZIP or postal code"),
        countryCode: z.string().length(2).optional().describe("Two-letter country code (e.g. US)"),
        description: z.string().optional().describe("Company description"),
        isAccount: z.boolean().optional().describe("Whether this is a managed account"),
        employeeCount: z.number().int().optional().describe("Number of employees"),
        deviceCount: z.number().int().optional().describe("Number of devices"),
      },
    },
    async ({ id, name, website, phone, email, address, city, region, zipCode, countryCode, description, isAccount, employeeCount, deviceCount }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.Name = name;
        if (website !== undefined) body.Website = website;
        if (phone !== undefined) body.Phone = phone;
        if (email !== undefined) body.Email = email;
        if (address !== undefined) body.Address = address;
        if (city !== undefined) body.City = city;
        if (region !== undefined) body.Region = region;
        if (zipCode !== undefined) body.ZipCode = zipCode;
        if (countryCode !== undefined) body.CountryCode = countryCode;
        if (description !== undefined) body.Description = description;
        if (isAccount !== undefined) body.IsAccount = isAccount;
        if (employeeCount !== undefined) body.EmployeeCount = employeeCount;
        if (deviceCount !== undefined) body.DeviceCount = deviceCount;
        const data = await ghRequest("PATCH", `/companies/${id}`, body);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );

  server.registerTool(
    "delete_company",
    {
      description: "Delete a company by ID",
      inputSchema: {
        id: z.number().int().describe("Company ID to delete"),
      },
    },
    async ({ id }) => {
      try {
        const data = await ghRequest("DELETE", `/companies/${id}`);
        return ok(data);
      } catch (e) { return err(e); }
    }
  );
}
