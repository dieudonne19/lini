// A wa.me link that opens WhatsApp on a conversation with `phone` (E.164, "+261…", the format members are stored in)
// with the message already typed. Nothing is sent: the person taps send themselves. Null when the number is not valid.
export function whatsappLink(phone: string, text: string) {
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) return null
  return `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(text)}`
}
