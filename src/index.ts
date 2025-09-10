import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
    name: "Todo Server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        elicitation: {
            mode: "forms"
        },
    },
});

server.registerTool("add-todod",
    {
        title: "Add Todo Tool",
        description: "Add a todo",
        inputSchema: { title: z.string(), description: z.string() }
    },
    async ({ title, description }) => {
        console.error("Adding todo", title, description);


        const result = await server.server.elicitInput({
            message: "Are you sure you want to add this todo?",
            requestedSchema: {
                type: "object",
                properties: {
                    confirmation: { type: "boolean" }
                }
            }
        });

        if (result.action === "accept" && result.content?.confirmation === true) {
            console.error("User confirmed the addition");
            return {
                content: [{ type: "text", text: "Todo added successfully" }]
            }
        }

        return {
            content: [{ type: "text", text: "You cancelled to add this todo, so its not added in the database" }]
        }
    }
);

server.registerResource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    {
        title: "Greeting Resource",      // Display name for UI
        description: "Dynamic greeting generator"
    },
    async (uri, { name }) => ({
        contents: [{
            uri: uri.href,
            text: `Hello, ${name}!`
        }]
    })
);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});