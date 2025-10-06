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
    <section className="flex w-full max-w-6xl flex-col gap-6 text-slate-100">
      <header className="space-y-2 text-center sm:text-left">
        <h2 className="text-3xl font-semibold text-slate-100">JSON 工具</h2>
        <p className="text-sm text-slate-400">
          粘贴或编写 JSON 数据，快速格式化、解析并以树状结构查看字段详情。
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
      <div className="grid h-[540px] gap-4 lg:grid-cols-2">
        <TextEditor value={rawInput} onChange={setRawInput} />
        {parseError ? (
          <ErrorPanel message={parseError} />
        ) : (
          <TreePreview value={parsedValue} expandedPaths={expandedPaths} onToggle={toggleNode} />
        )}
      </div>
    </section>
  );
}
