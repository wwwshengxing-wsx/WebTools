const ESCAPE_MAP: Record<string, string> = {
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  '\\f': '\f',
  '\\b': '\b',
  '\\\\': '\\',
};

/**
 * Convert a formatted JSON string into one where escape sequences become literal characters.
 * This intentionally keeps quoted double quotes escaped to avoid breaking structure entirely.
 */
function unescapeControlCharacters(input: string): string {
  return input.replace(/\\(?:n|r|t|f|b|\\)/g, (match) => ESCAPE_MAP[match] ?? match);
}

export function stringifyJson(value: unknown, preserveEscapes: boolean): string {
  const formatted = JSON.stringify(value, null, 2);
  if (preserveEscapes) {
    return formatted;
  }
  return unescapeControlCharacters(formatted);
}
