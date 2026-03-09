#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCompanyTools } from "./tools/companies.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerOpportunityTools } from "./tools/opportunities.js";
import { registerCampaignTools } from "./tools/campaigns.js";

const server = new McpServer({
  name: "glasshive-mcp",
  version: "0.1.0",
});

registerCompanyTools(server);
registerContactTools(server);
registerOpportunityTools(server);
registerCampaignTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
