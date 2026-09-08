export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Radio en vivo
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

    // Panel de administración
    if (url.pathname === "/admin") {
      return env.ASSETS.fetch(
        new Request(new URL("/admin.html", request.url), request)
      );
    }

    // Obtener noticias
    if (url.pathname === "/api/noticias" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM noticias ORDER BY id DESC"
      ).all();

      return Response.json(results);
    }

    // Guardar noticia
    if (url.pathname === "/api/noticias" && request.method === "POST") {
      try {
        const noticia = await request.json();

        const titulo = noticia.titulo || "";
        const contenido = noticia.resumen || noticia.contenido || "";
        const imagen = noticia.imagen || "";
        const fecha = noticia.fecha || new Date().toISOString().split("T")[0];
        const autor = noticia.autor || "Vibra Tu Radio";

        if (!titulo || !contenido) {
          return Response.json(
            { mensaje: "Faltan el título y el contenido de la noticia." },
            { status: 400 }
          );
        }

        await env.DB.prepare(
          `INSERT INTO noticias
           (titulo, contenido, imagen, fecha, autor)
           VALUES (?, ?, ?, ?, ?)`
        )
          .bind(titulo, contenido, imagen, fecha, autor)
          .run();

        return Response.json({
          mensaje: "Noticia guardada correctamente."
        });
      } catch (error) {
        return Response.json(
          {
            mensaje: "No se pudo guardar la noticia.",
            error: error.message
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
