import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const alt = "Lini, l’agenda partagé de la maison"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// The picture shown when the link is shared: the Lini logo and its promise, on the app's background color.
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/lini-logo.svg"))
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        background: "#f7f9fe",
        color: "#1f2540",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> tags */}
      <img
        src={`data:image/svg+xml;base64,${logo.toString("base64")}`}
        width={520}
        height={180}
        alt=""
      />
      <div style={{ display: "flex", fontSize: 52, fontWeight: 700 }}>
        L’agenda partagé de la maison
      </div>
      <div style={{ display: "flex", fontSize: 32, color: "#585d78" }}>
        Qui fait quoi, et quand tout le monde est libre
      </div>
    </div>,
    size
  )
}
