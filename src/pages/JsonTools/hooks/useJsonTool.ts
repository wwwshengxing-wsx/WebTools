import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stringifyJson } from '../lib/jsonStringify';
import { sampleJson } from '../lib/sampleJson';
import {
  collectExpandablePaths,
  collectFirstLevelExpanded,
  isExpandable,
} from '../utils/tree';

const ROOT_PATH = 'root';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const initialParse = (() => {
  try {
    return JSON.parse(sampleJson);
  } catch (error) {
    console.error('Failed to parse sample JSON', error);
    return null;
  }
})();

export interface UseJsonToolState {
  rawInput: string;
  parsedValue: unknown | null;
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
  const [parsedValue, setParsedValue] = useState<unknown | null>(initialParse);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPreserveEscapes, setIsPreserveEscapes] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    if (!initialParse) {
      return new Set([ROOT_PATH]);
    }
    return collectFirstLevelExpanded(initialParse, ROOT_PATH);
  });
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [lastFormatted, setLastFormatted] = useState<string | null>(null);

  const parsedRef = useRef<unknown | null>(parsedValue);
  useEffect(() => {
    parsedRef.current = parsedValue;
  }, [parsedValue]);

  const setExpandedPathsForValue = useCallback((value: unknown) => {
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
    (input: string, { silent }: { silent?: boolean } = {}): unknown | null => {
      try {
        const value = JSON.parse(input);
        setParsedValue(value);
        setParseError(null);
        setExpandedPathsForValue(value);
        return value;
      } catch (error) {
        const message = extractErrorMessage(error);
        setParseError(message);
        setParsedValue(null);
        setExpandedPaths(new Set([ROOT_PATH]));
        if (!silent) {
          scheduleMessage('解析失败，请检查 JSON 格式');
        }
        return null;
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
    if (value === null) {
      return;
    }
    const formatted = JSON.stringify(value, null, 2);
    setRawInput(formatted);
    setLastFormatted(formatted);
    scheduleMessage('JSON 已格式化');
  }, [parseInput, rawInput, scheduleMessage]);

  const runParse = useCallback(() => {
    const value = parseInput(rawInput);
    if (value === null) {
      return;
    }
    scheduleMessage('解析成功');
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
      if (value === null || value === undefined) {
        return;
      }
      const next = new Set<string>();
      collectExpandablePaths(value, ROOT_PATH, next);
      setExpandedPaths(next);
    },
    [],
  );

  const buildOutputString = useCallback(() => {
    if (parsedRef.current === null) {
      return null;
    }
    return stringifyJson(parsedRef.current, isPreserveEscapes);
  }, [isPreserveEscapes]);

  const copyResult = useCallback(async () => {
    const output = buildOutputString();
    if (!output) {
      scheduleMessage('无法复制：当前 JSON 无效');
      return;
    }
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API 不可用');
      }
      await navigator.clipboard.writeText(output);
      scheduleMessage('已复制到剪贴板');
    } catch (error) {
      console.error('Failed to copy JSON', error);
      scheduleMessage('复制失败，请手动复制');
    }
  }, [buildOutputString, scheduleMessage]);

  const downloadResult = useCallback(() => {
    const output = buildOutputString();
    if (!output) {
      scheduleMessage('无法导出：当前 JSON 无效');
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
      scheduleMessage('已导出 JSON 文件');
    } catch (error) {
      console.error('Failed to export JSON', error);
      scheduleMessage('导出失败');
    }
  }, [buildOutputString, scheduleMessage]);

  const clearInput = useCallback(() => {
    setRawInput('');
    setParsedValue(null);
    setParseError(null);
    setExpandedPaths(new Set([ROOT_PATH]));
    scheduleMessage('输入已清空');
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
