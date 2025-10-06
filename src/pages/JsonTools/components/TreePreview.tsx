import { TreeNode } from './TreeNode';
import type { JsonValue } from '../utils/tree';

interface TreePreviewProps {
  value: unknown | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

export function TreePreview({ value, expandedPaths, onToggle }: TreePreviewProps): JSX.Element {
  if (value === null || value === undefined) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/40 text-sm text-slate-500">
        输入有效 JSON 后将在此处显示树状视图
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-lg border border-slate-700 bg-slate-950/80 p-4 text-slate-100 shadow-inner shadow-slate-950/70">
      <TreeNode
        label="root"
        value={value as JsonValue}
        path="root"
        level={0}
        expandedPaths={expandedPaths}
        onToggle={onToggle}
      />
    </div>
  );
}
