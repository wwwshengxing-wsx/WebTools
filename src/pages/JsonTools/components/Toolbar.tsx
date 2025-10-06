interface ToolbarProps {
  onFormat: () => void;
  onRun: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
  isPreserveEscapes: boolean;
  onTogglePreserveEscapes: () => void;
  actionMessage: string | null;
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300';

const subtleButton =
  'inline-flex items-center justify-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-medium text-slate-300 transition hover:border-sky-400 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300';

export function Toolbar({
  onFormat,
  onRun,
  onExpandAll,
  onCollapseAll,
  onCopy,
  onDownload,
  onClear,
  isPreserveEscapes,
  onTogglePreserveEscapes,
  actionMessage,
}: ToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={buttonBase} onClick={onFormat} aria-label="格式化 JSON">
          格式化
        </button>
        <button type="button" className={buttonBase} onClick={onRun} aria-label="运行解析">
          在线运行
        </button>
        <div className="mx-2 hidden h-6 w-px bg-slate-700 sm:block" aria-hidden="true" />
        <button type="button" className={subtleButton} onClick={onExpandAll} aria-label="全部展开">
          全部展开
        </button>
        <button type="button" className={subtleButton} onClick={onCollapseAll} aria-label="全部折叠">
          全部折叠
        </button>
        <button type="button" className={subtleButton} onClick={onCopy} aria-label="复制 JSON">
          复制结果
        </button>
        <button type="button" className={subtleButton} onClick={onDownload} aria-label="导出 JSON">
          导出 JSON
        </button>
        <button type="button" className={subtleButton} onClick={onClear} aria-label="清空输入">
          清空
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
          <input
            type="checkbox"
            checked={isPreserveEscapes}
            onChange={onTogglePreserveEscapes}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-300"
            aria-label="保留转义字符"
          />
          保留转义
        </label>
        {actionMessage ? (
          <span className="text-xs text-sky-300" role="status">
            {actionMessage}
          </span>
        ) : null}
      </div>
    </div>
  );
}
