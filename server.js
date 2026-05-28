export default {
  async fetch(request, env) {
    if (request.method === "GET" && new URL(request.url).pathname === "/mcp") {
      return new Response(JSON.stringify({ status: "ok", name: "inpaint-mcp" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (request.method === "POST" && new URL(request.url).pathname === "/mcp") {
      const body = await request.json();
      
      if (body.method === "tools/list") {
        return Response.json({
          jsonrpc: "2.0", id: body.id,
          result: { tools: [{
            name: "inpaint_room",
            description: "Edit a specific area of a room photo using AI inpainting",
            inputSchema: {
              type: "object",
              properties: {
                image_url: { type: "string", description: "URL of the room photo" },
                replacement_prompt: { type: "string", description: "What to replace it with" }
              },
              required: ["image_url", "replacement_prompt"]
            }
          }]}
        });
      }

      if (body.method === "tools/call" && body.params?.name === "inpaint_r
