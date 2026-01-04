/**
 * Extract Hashtags - Parse #tags from content
 *
 * Extracts hashtags from text content for indexing.
 *
 * @module search/extractHashtags
 */

/**
 * Extract hashtags from text content
 *
 * @param content - Text content to parse
 * @returns Array of unique hashtags (lowercase, without #)
 *
 * @example
 * ```ts
 * const tags = extractHashtags('Hello #World #Ariob #world');
 * // ['world', 'ariob'] - unique, lowercase
 * ```
 */
export function extractHashtags(content: string): string[] {
  if (!content) return [];

  // Match #hashtag pattern (alphanumeric and underscore)
  const regex = /#(\w+)/g;
  const matches = content.match(regex);

  if (!matches) return [];

  // Extract tag names (without #), lowercase, deduplicate
  const tags = matches.map((tag) => tag.slice(1).toLowerCase());
  return Array.from(new Set(tags));
}

/**
 * Extract mentions from text content
 *
 * @param content - Text content to parse
 * @returns Array of unique mentions (lowercase, without @)
 *
 * @example
 * ```ts
 * const mentions = extractMentions('Hey @alice and @Bob!');
 * // ['alice', 'bob']
 * ```
 */
export function extractMentions(content: string): string[] {
  if (!content) return [];

  // Match @username pattern
  const regex = /@(\w+)/g;
  const matches = content.match(regex);

  if (!matches) return [];

  // Extract usernames (without @), lowercase, deduplicate
  const mentions = matches.map((m) => m.slice(1).toLowerCase());
  return Array.from(new Set(mentions));
}
