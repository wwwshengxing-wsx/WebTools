import { childPath, getJsonType, isArray, isExpandable } from '../utils/tree';
import type { JsonValue } from '../utils/tree';

interface TreeNodeProps {
  label: string;
  value: JsonValue;
  path: string;
  level: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

type PrimitiveValueType = string | number | boolean | null;

function PrimitiveValue({ value }: { value: PrimitiveValueType }): JSX.Element {
  if (typeof value === 'string') {
    return <span className="text-amber-300">"{value}"</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-emerald-300">{value}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-indigo-300">{String(value)}</span>;
  }
  return <span className="text-pink-300">null</span>;
}

function NodeBadge({ value }: { value: JsonValue }): JSX.Element {
  const type = getJsonType(value);
  return (
    <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {type}
    </span>
  );
}

export function TreeNode({
  label,
  value,
  path,
  level,
  expandedPaths,
  onToggle,
}: TreeNodeProps): JSX.Element {
  const expandable = isExpandable(value);
  const isExpanded = expandable && expandedPaths.has(path);

  return (
    <div className="flex flex-col" style={{ paddingLeft: level * 16 }}>
      <div className="flex items-center gap-2 text-sm">
        {expandable ? (
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-sky-400 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            onClick={() => onToggle(path)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
          >
            {isExpanded ? '-' : '+'}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center text-slate-700" aria-hidden="true">
            .
          </span>
        )}
        <span className="font-medium text-slate-200">{label}</span>
        <NodeBadge value={value} />
        {!expandable ? <PrimitiveValue value={value as PrimitiveValueType} /> : null}
        {expandable && !isExpanded ? (
          <span className="text-xs text-slate-500">
            {isArray(value)
              ? `(${value.length} items)`
              : `(${Object.keys(value).length} keys)`}
          </span>
        ) : null}
      </div>
      {expandable && isExpanded ? (
        <div className="flex flex-col gap-1 border-l border-slate-800 pl-6">
          {isArray(value)
            ? value.map((item, index) => (
                <TreeNode
                  key={index}
                  label={`[${index}]`}
                  value={item as JsonValue}
                  path={childPath(path, index)}
                  level={level + 1}
                  expandedPaths={expandedPaths}
                  onToggle={onToggle}
                />
              ))
            : Object.entries(value).map(([key, child]) => (
                <TreeNode
                  key={key}
                  label={key}
                  value={child as JsonValue}
                  path={childPath(path, key)}
                  level={level + 1}
                  expandedPaths={expandedPaths}
                  onToggle={onToggle}
                />
              ))}
        </div>
      ) : null}
    </div>
  );
}
