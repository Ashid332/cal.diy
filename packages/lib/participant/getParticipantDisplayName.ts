/**
 * Resolves the display name for a booking participant.
 * Replaces duplicated fallback logic across the repository.
 * 
 * @param name - The participant's provided name
 * @param fallback - The explicit string fallback to use if the name is falsy (e.g., email or "Nameless").
 * @returns The resolved display name.
 */
export function getParticipantDisplayName(name: string | null | undefined, fallback: string): string {
  // We use || to maintain behavioral equivalence with the majority of existing fallbacks 
  // (which used || to catch empty strings). For places that previously used ??, this 
  // safely normalizes empty strings to the fallback.
  return name || fallback;
}
