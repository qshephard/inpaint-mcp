import Replicate from "replicate";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";

const app = express();
app.use(express.json());

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const server = new McpServer({ name: "inpaint", version: "1.0.0" });

server.tool(
  "inpaint_room",
  "Edit a specific area of a room photo using AI inpainting",
  {
    image_url: z.string().describe("URL of the room photo"),
    replacement_prompt: z.string().describe("What to put there, e.g. 'a mid-century modern brass pendant light'"),
  },
  async ({ image_url, replacement_prompt }) => {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-inpainting",
      { input: { image: image_url, prompt: replacement_prompt, num_inference_steps: 30 } }
    );
    return { content: [{ type: "text", text: `Edited image: ${output[0]}` }] };
  }
);

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(process.env.PORT || 3000);
