const PLIST_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n';
const PLIST_FOOTER = '</plist>\n';

export interface ParsedTextReplacementItem {
  shortcut: string;
  phrase: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function parseTextReplacementXml(xmlText: string): ParsedTextReplacementItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML parsing error');
  }

  const arrayElement = doc.querySelector('plist > array');
  if (!arrayElement) {
    return [];
  }

  const dictElements = Array.from(arrayElement.querySelectorAll(':scope > dict'));
  const items: ParsedTextReplacementItem[] = [];

  dictElements.forEach((dict) => {
    const children = Array.from(dict.children);
    let phrase = '';
    let shortcut = '';

    for (let index = 0; index < children.length; index += 1) {
      const keyNode = children[index];
      const nextNode = children[index + 1];
      if (!keyNode || keyNode.tagName !== 'key' || !nextNode || nextNode.tagName !== 'string') {
        continue;
      }

      const keyName = keyNode.textContent?.trim();
      const value = nextNode.textContent ?? '';

      if (keyName === 'phrase') {
        phrase = value;
      }

      if (keyName === 'shortcut') {
        shortcut = value;
      }
    }

    if (shortcut.trim() || phrase.trim()) {
      items.push({
        shortcut: shortcut.trim(),
        phrase: phrase.trim(),
      });
    }
  });

  return items;
}

export function serializeTextReplacementItems(items: ParsedTextReplacementItem[]): string {
  const body = items
    .map((item) => {
      const phrase = escapeXml(item.phrase);
      const shortcut = escapeXml(item.shortcut);
      return `\t<dict>\n\t\t<key>phrase</key>\n\t\t<string>${phrase}</string>\n\t\t<key>shortcut</key>\n\t\t<string>${shortcut}</string>\n\t</dict>`;
    })
    .join('\n');

  return `${PLIST_HEADER}<array>\n${body}${body ? '\n' : ''}</array>\n${PLIST_FOOTER}`;
}
