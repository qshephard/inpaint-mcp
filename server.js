export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/mcp") {
      return new Response("inpaint-mcp running");
    }

    if (request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", name: "inpaint-mcp" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (request.method === "POST") {
      const body = await request.json();

      if (body.method === "tools/list") {
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            tools: [{
              name: "inpaint_room",
              description: "Edit a room photo using AI inpainting",
              inputSchema: {
                type: "object",
                properties: {
                  image_url: { type: "string", description: "URL of the room photo" },
                  replacement_prompt: { type: "string", description: "What to replace it with" }
                },
                required: ["image_url", "replacement_prompt"]
              }
            }]
          }
        }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.method === "tools/call") {
        const args = body.params.arguments;
        const rep = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": "Token " + env.REPLICATE_API_TOKEN,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            version: "854e8727697a057c525cdb45ab037f64ecca770a4e911be5700e549df0f75388",
            input: {
              image: args.image_url,
              prompt: args.replacement_prompt
            }
          })
        });
        const data = await rep.json();
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [{ type: "text", text: "Job started: " + data.id }]
          }
        }), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        jsonrpc: "2.0", id: body.id, result: {}
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Method not allowed", { status: 405 });
  }
};
