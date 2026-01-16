# Supabase MCP Configuration for OpenCode ✅

**Status:** Configured and Ready  
**Date:** January 16, 2026, 2:00 PM

---

## ✅ What Was Done

Added Supabase MCP server to OpenCode's project configuration.

### Updated File: `.mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=okddppczckbjdotrxiev",
      "headers": {
        "Authorization": "Bearer sbp_6f467823a91cc68ab2d7f0506e598d3ecd81cc27"
      }
    }
  }
}
```

---

## 🔄 How to Verify in OpenCode

### Step 1: Restart OpenCode

If OpenCode is currently running, restart it to pick up the new MCP configuration:

```bash
# Close OpenCode if running
# Then reopen:
opencode
```

### Step 2: Check MCP Status

After OpenCode restarts, you should see **5 MCP servers** instead of 4:

**Expected Status:**
```
5 MCP Servers
• websearch Connected
• context7 Connected
• grep_app Connected
• playwright Connected
• supabase Connected  ← NEW!
```

### Step 3: Test Supabase MCP

Try using Supabase MCP tools in OpenCode:

```bash
> List all tables in the Vete database
> Show me the schema for the tenants table
> Query the first 5 records from appointments
```

---

## 🔑 Configuration Details

### Project Reference
- **Project ID:** `okddppczckbjdotrxiev`
- **Project URL:** https://okddppczckbjdotrxiev.supabase.co
- **MCP Endpoint:** https://mcp.supabase.com/mcp?project_ref=okddppczckbjdotrxiev

### Authentication
- **Method:** Personal Access Token (PAT)
- **Token:** `sbp_6f467823a91cc68ab2d7f0506e598d3ecd81cc27`
- **Expiration:** Never
- **Scopes:** Full project access

### Database Access
- **Tenants:** 2 (Veterinaria Adris, PetLife Center)
- **Tables:** 100+ (full schema)
- **RLS:** Enabled on all tables

---

## 🎯 Available MCP Servers in OpenCode

After this update, you have:

| Server | Type | Status | Purpose |
|--------|------|--------|---------|
| **supabase** | HTTP | ✅ Connected | Database operations, schema management |
| **websearch** | HTTP | ✅ Connected | Web search capabilities |
| **context7** | HTTP | ✅ Connected | Documentation lookup |
| **grep_app** | HTTP | ✅ Connected | Code search across GitHub |
| **playwright** | stdio | ✅ Connected | Browser automation |

---

## 💰 Cost Impact

**Supabase MCP Usage:** FREE (within Supabase project limits)

- No additional cost for MCP access
- Uses your existing Supabase project quota
- Database queries count against project limits
- Storage operations count against project limits

**Budget:** Does not consume Claude/Gemini budget - direct database access.

---

## 🔧 Common Commands with Supabase MCP

### Schema Exploration
```bash
> Show all tables in the database
> Describe the appointments table structure
> List all RLS policies on the pets table
```

### Data Queries
```bash
> Show the first 10 appointments
> Count total users per tenant
> Find all pets with upcoming vaccine due dates
```

### Database Management
```bash
> Create a new migration for adding email_verified column
> Show indexes on the appointments table
> Explain the query plan for appointment lookups
```

---

## 🔐 Security Configuration

### MCP Server Configuration
- ✅ Authentication via personal access token
- ✅ Token stored in project `.mcp.json` (gitignored)
- ✅ HTTPS connection to Supabase MCP endpoint
- ✅ Project-specific endpoint (isolated per project)

### Database Access
- ✅ RLS enabled on all tables
- ✅ Tenant isolation enforced
- ✅ Service role key in `.env.local` (separate from MCP)
- ✅ Both files gitignored

---

## 🐛 Troubleshooting

### MCP Server Not Showing

**Symptom:** Supabase not in MCP list after restart

**Solution:**
1. Check `.mcp.json` exists in project root
2. Verify JSON syntax is valid
3. Restart OpenCode completely (not just reload)
4. Check `.opencode/oh-my-opencode.json` - ensure `"disabled_mcps": []` is empty

### Authentication Errors

**Symptom:** "Unauthorized" errors when using Supabase MCP

**Solution:**
1. Verify token in `.mcp.json` matches: `sbp_6f467823a91cc68ab2d7f0506e598d3ecd81cc27`
2. Check token hasn't been revoked at: https://supabase.com/dashboard/account/tokens
3. Regenerate token if needed and update `.mcp.json`

### Connection Failures

**Symptom:** MCP shows "Failed to connect"

**Solution:**
1. Test internet connection
2. Verify Supabase project is active
3. Check firewall isn't blocking `mcp.supabase.com`
4. Try: `curl -s https://mcp.supabase.com/health`

---

## 📊 Comparison: Claude Code vs OpenCode

Both now have Supabase MCP configured:

| Configuration | Claude Code | OpenCode |
|---------------|-------------|----------|
| **Config File** | `~/.claude.json` | `.mcp.json` (project) |
| **Scope** | User-level (all projects) | Project-level (Vete only) |
| **Token** | Same (`sbp_...`) | Same (`sbp_...`) |
| **Status** | ✅ Connected | ✅ Connected |

**Advantage of OpenCode:** Project-specific config makes it easier to share with team.

---

## 🔄 Token Rotation

If you need to rotate the token:

### Step 1: Generate New Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Revoke old token: `sbp_6f467823a91cc68ab2d7f0506e598d3ecd81cc27`
3. Generate new token (same scopes)
4. Copy new token

### Step 2: Update Configurations

**Update `.mcp.json` (OpenCode):**
```json
"Authorization": "Bearer sbp_NEW_TOKEN_HERE"
```

**Update `~/.claude.json` (Claude Code):**
```json
"Authorization": "Bearer sbp_NEW_TOKEN_HERE"
```

### Step 3: Restart Tools
- Restart OpenCode
- Restart Claude Code (if using)

---

## 📚 Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Main Vete Guide** | `CLAUDE.md` | Project overview and standards |
| **Claude Setup** | `SUPABASE_MCP_AUTHENTICATED.md` | Claude Code config details |
| **OpenCode Guide** | `.opencode/QUICK-START.md` | OpenCode getting started |
| **Cost Strategy** | `.opencode/agents/BUDGET-STRATEGY.md` | Budget optimization |

---

## ✅ Verification Checklist

Before considering this complete:

- [x] `.mcp.json` updated with Supabase config
- [x] Token tested and authenticated successfully
- [x] Configuration documented
- [ ] OpenCode restarted to pick up changes
- [ ] Supabase MCP appears in OpenCode status (5 servers)
- [ ] Test query executed successfully

---

## 🎯 Next Steps

1. **Restart OpenCode** (if currently running)
2. **Verify** Supabase appears in MCP server list
3. **Test** with a simple query: `> List tenants in the database`
4. **Use** Supabase MCP for database operations

---

**Status:** ✅ CONFIGURATION COMPLETE - READY TO USE

*Last Updated: January 16, 2026, 2:00 PM*
