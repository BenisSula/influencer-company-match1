# MCP Server Configuration Guide

## Configured MCP Servers

### 1. PostgreSQL Server
**Purpose**: Direct database interaction for queries, schema inspection, and data management

**Capabilities**:
- Execute SQL queries
- List tables and schemas
- Describe table structures
- Inspect database schema

**Configuration**:
```json
"POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/influencer_matching_db"
```

**Usage**:
- Query matching algorithm results
- Inspect entity relationships
- Debug database issues
- Validate migrations

**Important**: Update the connection string with your actual database credentials.

---

### 2. Filesystem Server
**Purpose**: File system operations for reading and managing project files

**Capabilities**:
- Read single or multiple files
- List directory contents
- Search for files
- Navigate project structure

**Auto-approved operations**: read_file, read_multiple_files, list_directory, search_files

**Usage**:
- Read configuration files
- Inspect source code
- Navigate project structure
- Search for specific files

---

### 3. Git Server
**Purpose**: Version control operations and change tracking

**Capabilities**:
- Check repository status
- View diffs (staged, unstaged, committed)
- View commit history
- Track file changes

**Auto-approved operations**: git_status, git_diff, git_log, git_diff_unstaged, git_diff_staged

**Usage**:
- Review code changes before committing
- Track feature development progress
- Debug issues by reviewing history
- Understand code evolution

---

### 4. GitHub Server (Disabled by default)
**Purpose**: GitHub API integration for repository management

**Status**: Disabled - Enable when needed for GitHub operations

**Setup**:
1. Generate a GitHub Personal Access Token
2. Add token to `GITHUB_PERSONAL_ACCESS_TOKEN` env variable
3. Set `disabled: false`

**Capabilities**:
- Create/manage issues
- Review pull requests
- Manage repositories
- Access GitHub API

---

### 5. Sequential Thinking Server
**Purpose**: Complex problem-solving through structured reasoning

**Capabilities**:
- Break down complex problems
- Multi-step analysis
- Hypothesis generation and verification
- Iterative problem solving

**Auto-approved operations**: sequentialThinking

**Usage**:
- Design matching algorithm logic
- Debug complex issues
- Plan feature architecture
- Analyze performance bottlenecks

---

### 6. Memory Server
**Purpose**: Knowledge graph for storing and retrieving project context

**Capabilities**:
- Create entities (users, features, concepts)
- Define relationships between entities
- Search knowledge graph
- Track project knowledge

**Auto-approved operations**: create_entities, create_relations, search_nodes, open_nodes, add_observations

**Usage**:
- Track feature requirements
- Document architecture decisions
- Store domain knowledge
- Link related concepts

---

### 7. Fetch Server
**Purpose**: HTTP requests for external API testing and documentation

**Capabilities**:
- Make HTTP requests
- Test API endpoints
- Fetch external documentation
- Validate integrations

**Auto-approved operations**: fetch

**Usage**:
- Test backend API endpoints
- Fetch library documentation
- Validate external integrations
- Debug HTTP issues

---

### 8. Brave Search Server (Disabled by default)
**Purpose**: Web search for documentation and solutions

**Status**: Disabled - Enable when needed for web searches

**Setup**:
1. Get Brave Search API key
2. Add key to `BRAVE_API_KEY` env variable
3. Set `disabled: false`

**Usage**:
- Search for library documentation
- Find solutions to errors
- Research best practices
- Discover new tools

---

### 9. Puppeteer Server (Disabled by default)
**Purpose**: Browser automation for E2E testing

**Status**: Disabled - Enable when implementing E2E tests

**Capabilities**:
- Automate browser interactions
- Take screenshots
- Test user flows
- Validate UI behavior

**Usage**:
- E2E testing for Electron app
- UI automation testing
- Screenshot generation
- Performance testing

---

### 10. Time Server
**Purpose**: Time and timezone operations

**Capabilities**:
- Get current time
- Get timezone information
- Time-based calculations

**Auto-approved operations**: get_current_time, get_timezone

**Usage**:
- Timestamp generation
- Timezone conversions
- Time-based testing
- Scheduling features

---

## MCP Server Usage Guidelines

### When to Use Each Server

**Development Phase**:
- **Filesystem**: Reading code, configuration files
- **Git**: Tracking changes, reviewing diffs
- **Sequential Thinking**: Planning features, solving problems
- **Memory**: Documenting decisions, tracking requirements

**Database Phase**:
- **PostgreSQL**: Schema design, query testing, data inspection
- **Filesystem**: Reading migration files, entity definitions

**Testing Phase**:
- **Fetch**: API endpoint testing
- **Puppeteer**: E2E testing (when enabled)
- **PostgreSQL**: Database state validation

**Debugging Phase**:
- **Git**: Review recent changes
- **PostgreSQL**: Inspect database state
- **Filesystem**: Read logs, configuration
- **Sequential Thinking**: Analyze complex issues

### Security Best Practices

1. **Never commit credentials**: Keep API keys and database passwords in environment variables
2. **Use placeholders**: Configuration file should have empty/placeholder values
3. **Rotate secrets**: Regularly update API keys and database passwords
4. **Limit auto-approve**: Only auto-approve safe, read-only operations
5. **Review operations**: Check MCP server logs for unexpected operations

### Enabling Disabled Servers

To enable GitHub, Brave Search, or Puppeteer:

1. Add required credentials to env variables
2. Change `"disabled": true` to `"disabled": false`
3. Restart Kiro to reload configuration
4. Test the server with a simple operation

### Troubleshooting

**Server not responding**:
- Check if `uvx` or `npx` is installed
- Verify network connectivity
- Check server logs in Kiro output

**Authentication errors**:
- Verify credentials are correct
- Check environment variable names
- Ensure API keys have required permissions

**Connection errors**:
- Verify database is running (PostgreSQL)
- Check connection string format
- Ensure firewall allows connections

---

## Project-Specific Recommendations

### For Influencer-Company Matching Platform

**Essential Servers** (keep enabled):
- PostgreSQL: Database operations
- Filesystem: Code navigation
- Git: Version control
- Sequential Thinking: Problem solving
- Memory: Knowledge tracking
- Fetch: API testing
- Time: Timestamp operations

**Optional Servers** (enable as needed):
- GitHub: If using GitHub for repository hosting
- Brave Search: For documentation searches
- Puppeteer: When implementing E2E tests

### Database Connection String

Update the PostgreSQL connection string with your actual credentials:

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

Example for local development:
```
postgresql://postgres:mypassword@localhost:5432/influencer_matching_db
```

Example for production:
```
postgresql://prod_user:secure_password@db.example.com:5432/influencer_matching_prod
```

**Security Note**: Never commit the actual connection string. Use environment variables or a secure secrets manager.