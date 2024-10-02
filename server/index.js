const http = require("http");
const push = require("./push");

http
  .createServer((request, response) => {
    try {
      response.setHeader("Access-Control-Allow-Origin", "*");
      const { url, method } = request;

      if (method === "POST" && url.match(/\/subscribe\/?/)) {
        let body = [];

        request
          .on("data", (chunk) => body.push(chunk))
          .on("end", () => {
            let subscription = JSON.parse(body.toString());
            push.addSubscription(subscription);
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Subscribed");
          })
          .on("error", (err) => {
            console.error("Error receiving data:", err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          });
      } else if (url.match(/\/key\/?/)) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end(push.getKey());
      } else if (method === "POST" && url.match(/\/push\/?/)) {
        let body = [];

        request
          .on("data", (chunk) => body.push(chunk))
          .on("end", () => {
            response.writeHead(200, { "Content-Type": "text/plain" });

            push.send(body.toString())
            response.end("Push Sent");
          })
          .on("error", (err) => {
            console.error("Error receiving data:", err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          });
      } else {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Error: Unknown Endpoint");
      }
    } catch (err) {
      console.error("Server error:", err);
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.end("Internal Server Error");
    }
  })
  .listen(3333, () => {
    console.log("Server Running on port 3333");
  });
