export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export type JsonObject = Record<string, JsonValue>;
export type JsonArray = JsonValue[];

export function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: unknown): value is JsonArray {
  return Array.isArray(value);
}

export function isExpandable(value: unknown): value is JsonObject | JsonArray {
  return isObject(value) || isArray(value);
}

export function getJsonType(value: JsonValue): string {
  if (isArray(value)) {
    return 'array';
  }
  if (isObject(value)) {
    return 'object';
  }
  if (value === null) {
    return 'null';
  }
  return typeof value;
}

export function childPath(parentPath: string, key: string | number): string {
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }
  return parentPath === '' ? key : `${parentPath}.${key}`;
}

export function collectExpandablePaths(
  value: unknown,
  currentPath: string,
  store: Set<string>,
): void {
  if (!isExpandable(value)) {
    return;
  }

  store.add(currentPath);

  if (isArray(value)) {
    value.forEach((item, index) => {
      collectExpandablePaths(item, childPath(currentPath, index), store);
    });
    return;
  }

  Object.entries(value).forEach(([key, child]) => {
    collectExpandablePaths(child, childPath(currentPath, key), store);
  });
}

export function collectFirstLevelExpanded(value: unknown, rootPath: string): Set<string> {
  const result = new Set<string>();
  if (!isExpandable(value)) {
    return result;
  }
  result.add(rootPath);
  if (isArray(value)) {
    value.forEach((child, index) => {
      if (isExpandable(child)) {
        result.add(childPath(rootPath, index));
      }
    });
    return result;
  }
  Object.entries(value).forEach(([key, child]) => {
    if (isExpandable(child)) {
      result.add(childPath(rootPath, key));
    }
  });
  return result;
}
