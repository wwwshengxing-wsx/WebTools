import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stringifyJson } from '../lib/jsonStringify';
import { sampleJson } from '../lib/sampleJson';
import {
  collectExpandablePaths,
  collectFirstLevelExpanded,
  isExpandable,
  isJsonValue,
  type JsonValue,
} from '../utils/tree';

const ROOT_PATH = 'root';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const initialParse: JsonValue | undefined = (() => {
  try {
    const candidate = JSON.parse(sampleJson) as unknown;
    if (isJsonValue(candidate)) {
      return candidate;
    }
    console.error('Sample JSON did not resolve to a supported structure.');
    return undefined;
  } catch (error) {
    console.error('Failed to parse sample JSON', error);
    return undefined;
  }
})();

export interface UseJsonToolState {
  rawInput: string;
  parsedValue: JsonValue | undefined;
  parseError: string | null;
  isPreserveEscapes: boolean;
  expandedPaths: Set<string>;
  actionMessage: string | null;
  lastFormatted: string | null;
  setRawInput: (value: string) => void;
  formatJson: () => void;
  runParse: () => void;
  togglePreserveEscapes: () => void;
  toggleNode: (path: string) => void;
  setAllExpanded: (expand: boolean) => void;
  copyResult: () => Promise<void>;
  downloadResult: () => void;
  clearInput: () => void;
}

export function useJsonTool(): UseJsonToolState {
  const [rawInput, setRawInput] = useState(sampleJson);
  const [parsedValue, setParsedValue] = useState<JsonValue | undefined>(initialParse);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPreserveEscapes, setIsPreserveEscapes] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    if (initialParse === undefined) {
      return new Set([ROOT_PATH]);
    }
    return collectFirstLevelExpanded(initialParse, ROOT_PATH);
  });
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [lastFormatted, setLastFormatted] = useState<string | null>(null);

  const parsedRef = useRef<JsonValue | undefined>(parsedValue);
  useEffect(() => {
    parsedRef.current = parsedValue;
  }, [parsedValue]);

  const setExpandedPathsForValue = useCallback((value: JsonValue) => {
    if (!isExpandable(value)) {
      setExpandedPaths(new Set([ROOT_PATH]));
      return;
    }
    setExpandedPaths(collectFirstLevelExpanded(value, ROOT_PATH));
  }, []);

  const scheduleMessage = useCallback((message: string | null) => {
    setActionMessage(message);
  }, []);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }
    const timeout = window.setTimeout(() => setActionMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  const parseInput = useCallback(
    (input: string, { silent }: { silent?: boolean } = {}): JsonValue | undefined => {
      try {
        const candidate = JSON.parse(input) as unknown;
        if (!isJsonValue(candidate)) {
          throw new Error('Parsed result includes unsupported value types');
        }
        const value = candidate;
        setParsedValue(value);
        setParseError(null);
        setExpandedPathsForValue(value);
        return value;
      } catch (error) {
        const message = extractErrorMessage(error);
        setParseError(message);
        setParsedValue(undefined);
        setExpandedPaths(new Set([ROOT_PATH]));
        if (!silent) {
          scheduleMessage('Parse failed, please check JSON syntax');
        }
        return undefined;
      }
    },
    [scheduleMessage, setExpandedPathsForValue],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      parseInput(rawInput, { silent: true });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [parseInput, rawInput]);

  const formatJson = useCallback(() => {
    const value = parseInput(rawInput);
    if (value === undefined) {
      return;
    }
    const formatted = JSON.stringify(value, null, 2);
    setRawInput(formatted);
    setLastFormatted(formatted);
    scheduleMessage('JSON formatted');
  }, [parseInput, rawInput, scheduleMessage]);

  const runParse = useCallback(() => {
    const value = parseInput(rawInput);
    if (value === undefined) {
      return;
    }
    scheduleMessage('Parse succeeded');
  }, [parseInput, rawInput, scheduleMessage]);

  const togglePreserveEscapes = useCallback(() => {
    setIsPreserveEscapes((prev) => !prev);
  }, []);

  const toggleNode = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const setAllExpanded = useCallback(
    (expand: boolean) => {
      if (!expand) {
        setExpandedPaths(new Set([ROOT_PATH]));
        return;
      }
      const value = parsedRef.current;
      if (value === undefined) {
        return;
      }
      const next = new Set<string>();
      collectExpandablePaths(value, ROOT_PATH, next);
      setExpandedPaths(next);
    },
    [],
  );

  const buildOutputString = useCallback(() => {
    if (parsedRef.current === undefined) {
      return null;
    }
    return stringifyJson(parsedRef.current, isPreserveEscapes);
  }, [isPreserveEscapes]);

  const copyResult = useCallback(async () => {
    const output = buildOutputString();
    if (!output) {
      scheduleMessage('Copy unavailable: JSON is invalid');
      return;
    }
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(output);
      scheduleMessage('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy JSON', error);
      scheduleMessage('Copy failed, please copy manually');
    }
  }, [buildOutputString, scheduleMessage]);

  const downloadResult = useCallback(() => {
    const output = buildOutputString();
    if (!output) {
      scheduleMessage('Export unavailable: JSON is invalid');
      return;
    }
    try {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'json-tool-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      scheduleMessage('Exported JSON file');
    } catch (error) {
      console.error('Failed to export JSON', error);
      scheduleMessage('Export failed');
    }
  }, [buildOutputString, scheduleMessage]);

  const clearInput = useCallback(() => {
    setRawInput('');
    setParsedValue(undefined);
    setParseError(null);
    setExpandedPaths(new Set([ROOT_PATH]));
    scheduleMessage('Input cleared');
  }, [scheduleMessage]);

  const expandedPathsMemo = useMemo(() => new Set(expandedPaths), [expandedPaths]);

  return {
    rawInput,
    parsedValue,
    parseError,
    isPreserveEscapes,
    expandedPaths: expandedPathsMemo,
    actionMessage,
    lastFormatted,
    setRawInput,
    formatJson,
    runParse,
    togglePreserveEscapes,
    toggleNode,
    setAllExpanded,
    copyResult,
    downloadResult,
    clearInput,
  };
}
