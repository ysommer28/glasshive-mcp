#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCompanyTools } from "./tools/companies.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerOpportunityTools } from "./tools/opportunities.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerListTools } from "./tools/lists.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerSolutionTools } from "./tools/solutions.js";
import { registerUserTools } from "./tools/users.js";
import { registerCollateralTools } from "./tools/collaterals.js";
import { registerFormSubmissionTools } from "./tools/form-submissions.js";

const server = new McpServer({
  name: "glasshive-mcp",
  version: "0.1.0",
});

registerCompanyTools(server);
registerContactTools(server);
registerOpportunityTools(server);
registerCampaignTools(server);
registerListTools(server);
registerActivityTools(server);
registerSolutionTools(server);
registerUserTools(server);
registerCollateralTools(server);
registerFormSubmissionTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
