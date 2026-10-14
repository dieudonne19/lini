import { describe, expect, it } from "vitest"

import { whatsappLink } from "@/lib/whatsapp"

describe("whatsappLink", () => {
  it("opens the conversation with the number, without the plus, and the message ready", () => {
    expect(whatsappLink("+261341234567", "Salut Léo : « Dîner »")).toBe(
      "https://wa.me/261341234567?text=Salut%20L%C3%A9o%20%3A%20%C2%AB%20D%C3%AEner%20%C2%BB"
    )
  })

  it("refuses what is not an international number", () => {
    expect(whatsappLink("0341234567", "x")).toBeNull()
    expect(whatsappLink("+0123456789", "x")).toBeNull()
    expect(whatsappLink("+12", "x")).toBeNull()
    expect(whatsappLink("", "x")).toBeNull()
    expect(whatsappLink("https://evil.test/?+261341234567", "x")).toBeNull()
  })
})
