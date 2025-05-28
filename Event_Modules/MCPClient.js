import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Anthropic } from "@anthropic-ai/sdk";


/**
 * Claude MCP client that connects to an MCP server and submits queries to Claude.
 */
class MCPClient {
    /**
     * @param {Object} config - Configuration options.
     * @param {string} config.anthropicApiKey - Your Anthropic API key.
     * @param {string} config.anthropicBaseURL - The base URL for the Anthropic API.
     */
    constructor({ anthropicApiKey, anthropicBaseURL }) {
        // Initialize the Anthropic (Claude) client.
        this.anthropic = new Anthropic({
            apiKey: anthropicApiKey,
            baseURL: anthropicBaseURL,
        });
        // Initialize the MCP client.
        this.mcp = new Client({ name: "claude-mcp-client", version: "1.0.0" });
        // These properties will be assigned later.
        this.transport = null;
        this.tools = [];
    }

    /**
     * Connects to an MCP server using the provided server script path.
     *
     * @param {string} serverScriptPath - Path to the server script (.js file).
     * @returns {Promise<void>}
     */
    async connectToServer(serverScriptPath) {
        try {
            // Ensure that the provided script is a JavaScript file.
            if (!serverScriptPath.endsWith(".js")) {
                throw new Error("Server script must be a .js file");
            }

            // Obtain the Node.js executable path.
            const command = process.execPath;

            // Initialize the transport to run the server script.
            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });

            // Connect to the MCP server.
            await this.mcp.connect(this.transport);

            // Retrieve and format the list of tools available from the server.
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));

            console.log(
                "Connected to MCP server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (error) {
            console.error("Failed to connect to MCP server:", error);
            throw error;
        }
    }

    /**
     * Submits a query to Claude via the Anthropic API.
     *
     * @param {string} query - The query or prompt for Claude.
     * @returns {Promise<Object>} - The response from Claude.
     */
    async submitQuery() {
        try {
            // Send the query to Claude using Anthropic's completion API.
            const response = await this.anthropic.messages.create({
                model: 'claude-opus-4-20250514',
                max_tokens: 1000,
                messages: global.aimsgs
            });
            console.log("Response from Claude:", response);
            return response;
        } catch (error) {
            console.error("Failed to submit query:", error);
            throw error;
        }
    }
}

export default MCPClient;