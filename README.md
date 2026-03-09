# glasshive-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.info/) server for the [GlassHive](https://glasshive.com) CRM & marketing platform. Lets AI assistants (Claude, etc.) read and manage GlassHive contacts, companies, opportunities, and campaigns through natural language.

## Tools

### Companies
| Tool | Description |
|------|-------------|
| `get_companies` | List companies with optional pagination |
| `get_company` | Get a single company by ID |
| `create_company` | Create a new company |
| `update_company` | Update an existing company by ID |

### Contacts
| Tool | Description |
|------|-------------|
| `get_contacts` | List contacts with optional pagination |
| `get_contact` | Get a single contact by ID |
| `create_contact` | Create a new contact |
| `update_contact` | Update an existing contact by ID |

### Opportunities
| Tool | Description |
|------|-------------|
| `get_opportunities` | List opportunities with optional pagination |
| `get_opportunity` | Get a single opportunity by ID |
| `create_opportunity` | Create a new deal/opportunity |
| `update_opportunity` | Update an existing opportunity by ID |

### Campaigns
| Tool | Description |
|------|-------------|
| `get_campaigns` | List email campaigns with stats (open rate, click rate, etc.) |
| `get_campaign` | Get full stats for a single campaign by ID |

## Requirements

- Node.js ≥ 18
- A GlassHive Partner API key

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/glasshive-mcp.git
cd glasshive-mcp
npm install
npm run build
```

## Configuration

Set your GlassHive API key as an environment variable:

```bash
export GLASSHIVE_API_KEY=your-api-key-here
```

Or create a `.env` file (see `.env.example`). The key is sent as the `authorization` header per the GlassHive Partner API spec.

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

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

## Usage with Claude Code

Add to `.claude/settings.json` in your project (or `~/.claude/settings.json` globally):

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

## Development

```bash
npm run dev   # Watch mode (recompiles on change)
npm run build # Production build
```

The server uses stdio transport (stdin/stdout). **Do not use `console.log()`** in any tool handlers — it corrupts the JSON-RPC stream. Use `console.error()` for debug output.

## API Reference

This server wraps the [GlassHive Partner REST API](https://docs.api.glasshive.com/api-details#api=partner).

Base URL: `https://rest.api.glasshive.com/partner/v1`

## License

MIT
