# glasshive-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.info/) server for the [GlassHive](https://glasshive.com) CRM & marketing platform. Connect any MCP-compatible AI assistant (Claude Desktop, Claude Code, Cursor, etc.) to your GlassHive account and manage your CRM through natural language.

> Built by [CSW Solutions](https://cswsolutions.com) · MIT License · Contributions welcome

---

## What is this?

MCP (Model Context Protocol) is an open standard that lets AI assistants call external tools. This server exposes the GlassHive Partner REST API as a set of tools that any MCP-compatible AI can use.

**Example prompts once connected:**
- *"How many contacts do I have in GlassHive?"*
- *"Create a contact named John Smith at Acme Corp and add him to the Newsletter list"*
- *"Log a call with contact 1234 — we discussed their renewal"*
- *"Show me the open rate on our last 5 campaigns"*
- *"Create an opportunity for $45,000 linked to CPS"*

---

## Tools Reference (51 tools)

> **Note on the GlassHive API:** The Partner v1 API returns only `{Id: ...}` for all list and GET endpoints — no names, emails, or other fields. The `search_contacts`, `search_companies`, `register_contact`, and `register_company` tools work around this using a local cache (`~/.glasshive-mcp-cache.json`). Contacts and companies created via this MCP are cached automatically. For pre-existing records, use the `register_*` tools once to add them.

### Companies
| Tool | Description |
|------|-------------|
| `get_companies` | List companies with optional pagination |
| `get_company` | Get a single company by ID |
| `create_company` | Create a new company (auto-cached) |
| `update_company` | Update an existing company |
| `delete_company` | Delete a company |
| `search_companies` | Search companies by name/email/website (local cache) |
| `register_company` | Register an existing company in the local search cache |

### Contacts
| Tool | Description |
|------|-------------|
| `get_contacts` | List contacts with optional pagination |
| `get_contact` | Get a single contact by ID |
| `create_contact` | Create a new contact (auto-cached) |
| `update_contact` | Update an existing contact |
| `delete_contact` | Delete a contact |
| `get_contact_opportunities` | Get all opportunities for a contact |
| `get_contact_lists` | Get all lists a contact belongs to |
| `add_contact_to_lists` | Add a contact to one or more lists |
| `remove_contact_from_list` | Remove a contact from a list |
| `search_contacts` | Search contacts by name/email/company (local cache) |
| `register_contact` | Register an existing contact in the local search cache |

### Opportunities
| Tool | Description |
|------|-------------|
| `get_opportunities` | List opportunities with optional pagination |
| `get_opportunity` | Get a single opportunity by ID |
| `create_opportunity` | Create a new deal/opportunity |
| `update_opportunity` | Update an existing opportunity |
| `delete_opportunity` | Delete an opportunity |
| `add_opportunity_line_item` | Add a line item to an opportunity |
| `update_opportunity_line_item` | Update a line item |
| `delete_opportunity_line_item` | Delete a line item |

### Activities (CRM Feed)
| Tool | Description |
|------|-------------|
| `get_activities` | List all activities |
| `get_activity` | Get a single activity by ID |
| `get_meetings` | List all meeting activities |
| `log_call` | Log a call with a contact |
| `log_email` | Log an email to/from a contact |
| `log_note` | Log a note for a contact |
| `log_meeting` | Log a meeting with one or more contacts |
| `update_activity` | Update an existing activity |
| `delete_activity` | Delete an activity |

### Lists (Contact Lists)
| Tool | Description |
|------|-------------|
| `get_lists` | List all contact lists |
| `get_list` | Get a single list by ID |
| `get_list_contacts` | Get all contacts in a list |
| `create_list` | Create a new contact list |
| `update_list` | Update a contact list |
| `delete_list` | Delete a contact list |

### Campaigns
| Tool | Description |
|------|-------------|
| `get_campaigns` | List campaigns with engagement stats |
| `get_campaign` | Get a campaign's full stats (open rate, click rate, bounces, etc.) |

### Solutions (Product Catalog)
| Tool | Description |
|------|-------------|
| `get_solutions` | List all solutions/products |
| `get_solution` | Get a single solution by ID |
| `create_solution` | Create a new solution |
| `update_solution` | Update a solution |
| `delete_solution` | Delete a solution |

### Users & Accounts
| Tool | Description |
|------|-------------|
| `get_users` | List all users |
| `get_user` | Get a single user by UUID |
| `update_user` | Update user profile and quota settings |
| `get_accounts` | List all partner accounts |

### Collaterals
| Tool | Description |
|------|-------------|
| `get_collaterals` | List marketing collateral assets |
| `get_collateral` | Get a single collateral asset |

### Form Submissions
| Tool | Description |
|------|-------------|
| `get_form_submissions` | List inbound form submissions / leads |
| `get_form_submission` | Get a single form submission |

---

## Requirements

- **Node.js** ≥ 18
- A **GlassHive Partner API key** — available in your GlassHive account under Settings → API

---

## Installation

```bash
git clone https://github.com/ysommer28/glasshive-mcp.git
cd glasshive-mcp
npm install
npm run build
```

This compiles TypeScript to `build/index.js`. You need to rebuild after any code changes (`npm run build`).

---

## Getting Your API Key

1. Log in to [GlassHive](https://glasshive.com)
2. Go to **Settings → Integrations → API**
3. Copy your Partner API key

---

## Setup: Claude Desktop

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the `glasshive` entry to `mcpServers`:

```json
{
  "mcpServers": {
    "glasshive": {
      "command": "node",
      "args": ["/absolute/path/to/glasshive-mcp/build/index.js"],
      "env": {
        "GLASSHIVE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. You should see GlassHive tools available.

---

## Setup: Claude Code (CLI)

Add to your global MCP config at `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "glasshive": {
      "command": "node",
      "args": ["/absolute/path/to/glasshive-mcp/build/index.js"],
      "env": {
        "GLASSHIVE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Or add it to a specific project by going to **Settings → MCP Servers** inside a Claude Code session.

---

## Setup: Cursor / Windsurf / Other MCP Clients

Most MCP clients support the same `stdio` transport config:

```json
{
  "mcpServers": {
    "glasshive": {
      "command": "node",
      "args": ["/absolute/path/to/glasshive-mcp/build/index.js"],
      "env": {
        "GLASSHIVE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Check your client's documentation for the exact config file location.

---

## Environment Variable

| Variable | Required | Description |
|----------|----------|-------------|
| `GLASSHIVE_API_KEY` | Yes | Your GlassHive Partner API key (UUID format) |

The key is passed as the `authorization` header on every API request, per the GlassHive Partner API spec.

---

## Project Structure

```
glasshive-mcp/
├── src/
│   ├── index.ts              # Entry point — registers all tools, starts stdio server
│   ├── client.ts             # GlassHive API fetch wrapper + error handling
│   └── tools/
│       ├── activities.ts     # CRM activity feed (calls, emails, notes, meetings)
│       ├── campaigns.ts      # Email campaign stats
│       ├── collaterals.ts    # Marketing assets
│       ├── companies.ts      # Company CRUD
│       ├── contacts.ts       # Contact CRUD + list membership + opportunities
│       ├── form-submissions.ts # Inbound leads
│       ├── lists.ts          # Contact list management
│       ├── opportunities.ts  # Deal/opportunity CRUD + line items
│       ├── solutions.ts      # Product/service catalog
│       └── users.ts          # User management and accounts
├── build/                    # Compiled output (git-ignored, run npm run build)
├── .env.example              # Copy to .env for local development
├── package.json
└── tsconfig.json
```

---

## How It Works

1. Your AI client (Claude, Cursor, etc.) starts this server as a subprocess via stdio
2. The server registers all 47 tools with the MCP SDK
3. When you ask the AI something GlassHive-related, it calls the appropriate tool
4. The tool makes a REST API call to `https://rest.api.glasshive.com/partner/v1`
5. The result is returned to the AI as JSON, which it summarises for you

All tools return raw JSON from the GlassHive API on success, or a clear error message on failure.

---

## Development

```bash
npm run dev    # TypeScript watch mode — recompiles on file changes
npm run build  # Production build
npm start      # Run the compiled server directly
```

**Important:** This server uses `stdio` transport. Never use `console.log()` inside tool handlers — it writes to stdout and corrupts the JSON-RPC stream. Use `console.error()` for any debug output instead.

---

## Contributing

1. Fork the repo
2. Add your tools in `src/tools/` following the existing pattern
3. Register them in `src/index.ts`
4. Run `npm run build` to verify compilation
5. Open a PR

The GlassHive Partner API reference is at: https://docs.api.glasshive.com/api-details#api=partner

---

## License

MIT — free to use, modify, and distribute.
