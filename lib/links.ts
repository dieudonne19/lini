// The personal login link of a member. `origin` is passed in so this stays usable on server and client.
export function personalLink(origin: string, token: string) {
  return `${origin}/m/${token}`
}
