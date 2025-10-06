export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = unknown[];
export type JsonObject = Record<string, unknown>;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) {
    return true;
  }
  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }
  if (valueType === 'object') {
    return Object.values(value as JsonObject).every((item) => isJsonValue(item));
  }
  return false;
}

export function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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
  value: JsonValue,
  currentPath: string,
  store: Set<string>,
): void {
  if (!isExpandable(value)) {
    return;
  }

  store.add(currentPath);

  if (isArray(value)) {
    value.forEach((item, index) => {
      if (isJsonValue(item)) {
        collectExpandablePaths(item, childPath(currentPath, index), store);
      }
    });
    return;
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([key, child]) => {
      if (isJsonValue(child)) {
        collectExpandablePaths(child, childPath(currentPath, key), store);
      }
    });
  }
}

export function collectFirstLevelExpanded(value: JsonValue, rootPath: string): Set<string> {
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
  if (isObject(value)) {
    Object.entries(value).forEach(([key, child]) => {
      if (isExpandable(child)) {
        result.add(childPath(rootPath, key));
      }
    });
  }
  return result;
}
