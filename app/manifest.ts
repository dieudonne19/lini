import type { MetadataRoute } from "next"

// What makes Lini installable on a home screen. The colors are the app's background (see globals.css).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lini",
    short_name: "Lini",
    description: "L’agenda partagé de la maison",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fe",
    theme_color: "#f7f9fe",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
