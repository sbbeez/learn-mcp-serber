import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
    name: "sample-calculator-using-ai",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        elicitation: {
            mode: "forms"
        },
    },
});

server.registerTool("add",
    {
        title: "Addition Tool",
        description: "Add two numbers",
        inputSchema: { a: z.number(), b: z.number() }
    },
    async ({ a, b }) => {
        console.error("Adding two numbers", a, b);


        const result = await server.server.elicitInput({
            message: "Are you sure you want to add these numbers?",
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
                content: [{ type: "text", text: String(a + b) }]
            }
        }

        return {
            content: [{ type: "text", text: "You did not confirm the addition" }]
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