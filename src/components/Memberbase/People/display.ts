import type { Member } from '~src/queries/members'

type Named = Partial<Pick<Member, 'name' | 'surname' | 'email' | 'memberNumber'>>

/**
 * How a member is named in lists: "Anna Vila Puig", or "Vila Puig, Anna" while the list is sorted by
 * surname. Without a name it falls back to the email, then the member number; empty if none.
 */
export const memberDisplayName = (member: Named, surnameFirst = false) => {
  const name = member.name?.trim()
  const surname = member.surname?.trim()
  if (surnameFirst && name && surname) return `${surname}, ${name}`
  return [name, surname].filter(Boolean).join(' ') || member.email?.trim() || member.memberNumber?.trim() || ''
}

/** Whether a key press is typing (so single-letter shortcuts must leave it alone). */
export const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** The visible element of a member's name link (the table and the cards both render one). */
export const findMemberLink = (id: string) => {
  const links = Array.from(document.querySelectorAll<HTMLElement>(`[data-member-link="${id}"]`))
  return links.find((link) => link.offsetParent !== null) ?? links[0] ?? null
}
