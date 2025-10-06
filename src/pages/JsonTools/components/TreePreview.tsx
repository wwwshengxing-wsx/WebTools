import { TreeNode } from './TreeNode';
import type { JsonValue } from '../utils/tree';

interface TreePreviewProps {
  value: JsonValue | undefined;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

export function TreePreview({ value, expandedPaths, onToggle }: TreePreviewProps): JSX.Element {
  if (value === undefined) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/40 text-sm text-slate-500">
        Provide valid JSON to display the structured preview here
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-lg border border-slate-700 bg-slate-950/80 p-4 text-slate-100 shadow-inner shadow-slate-950/70">
      <TreeNode
        label="root"
        value={value}
        path="root"
        level={0}
        expandedPaths={expandedPaths}
        onToggle={onToggle}
      />
    </div>
  );
}
