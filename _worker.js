export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/stream") {
      const radio = await fetch(
        "http://142.4.216.48:8111/stream"
      );

      const headers = new Headers(radio.headers);
      headers.set("Cache-Control", "no-store");
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(radio.body, {
        status: radio.status,
        headers: headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
