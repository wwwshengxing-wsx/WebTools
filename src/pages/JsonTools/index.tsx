import { Toolbar } from './components/Toolbar';
import { TextEditor } from './components/TextEditor';
import { TreePreview } from './components/TreePreview';
import { ErrorPanel } from './components/ErrorPanel';
import { useJsonTool } from './hooks/useJsonTool';

export default function JsonToolsPage(): JSX.Element {
  const {
    rawInput,
    setRawInput,
    parsedValue,
    parseError,
    isPreserveEscapes,
    expandedPaths,
    actionMessage,
    formatJson,
    runParse,
    togglePreserveEscapes,
    toggleNode,
    setAllExpanded,
    copyResult,
    downloadResult,
    clearInput,
  } = useJsonTool();

  return (
    <section className="w-full rounded-3xl border border-slate-800/60 bg-slate-900/55 px-4 py-6 text-slate-100 shadow-[0_45px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl sm:px-8 sm:py-8">
      <header className="space-y-2 pb-4 text-center sm:text-left">
        <h2 className="text-3xl font-semibold tracking-wide text-slate-100">JSON 工具</h2>
        <p className="text-sm text-slate-300 sm:text-base">
          粘贴或编写 JSON 数据，快速格式化、验证，并在右侧树状结构中对比字段层级。
        </p>
      </header>
      <Toolbar
        onFormat={formatJson}
        onRun={runParse}
        onExpandAll={() => setAllExpanded(true)}
        onCollapseAll={() => setAllExpanded(false)}
        onCopy={copyResult}
        onDownload={downloadResult}
        onClear={clearInput}
        isPreserveEscapes={isPreserveEscapes}
        onTogglePreserveEscapes={togglePreserveEscapes}
        actionMessage={actionMessage}
      />
      <div className="grid min-h-[520px] gap-6 pt-4 lg:grid-cols-2">
        <div className="flex h-full flex-col">
          <TextEditor value={rawInput} onChange={setRawInput} />
        </div>
        <div className="flex h-full flex-col">
          {parseError ? (
            <ErrorPanel message={parseError} />
          ) : (
            <TreePreview value={parsedValue} expandedPaths={expandedPaths} onToggle={toggleNode} />
          )}
        </div>
      </div>
    </section>
  );
}
