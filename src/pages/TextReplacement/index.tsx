import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import TextReplacementToolbar from './components/TextReplacementToolbar';
import TextReplacementTable from './components/TextReplacementTable';
import EditDialog from './components/EditDialog';
import ImportPreviewDrawer from './components/ImportPreviewDrawer';
import HistoryPanel from './components/HistoryPanel';
import { parseTextReplacementXml } from './lib/xml';
import {
  useTextReplacementEntries,
  type TextReplacementEntry,
  type SortBy,
} from './hooks/useTextReplacementEntries';

export default function TextReplacementPage(): JSX.Element {
  const {
    visibleEntries,
    entries,
    sortBy,
    sortOrder,
    searchTerm,
    historyEntries,
    importPreview,
    setSearchTerm,
    setSortBy,
    toggleSortOrder,
    saveEntry,
    deleteEntry,
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
    undoHistory,
    exportEntriesAsXml,
  } = useTextReplacementEntries();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    entry: TextReplacementEntry | null;
  }>({ isOpen: false, entry: null });
  const [importError, setImportError] = useState('');

  const openNewEntryDialog = () => {
    setDialogState({ isOpen: true, entry: null });
  };

  const openEditDialog = (entry: TextReplacementEntry) => {
    setDialogState({ isOpen: true, entry });
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, entry: null });
  };

  const handleDialogSave = (values: { shortcut: string; phrase: string }) => {
    if (dialogState.entry) {
      saveEntry({ id: dialogState.entry.id, ...values });
    } else {
      saveEntry(values);
    }
    closeDialog();
  };

  const handleImportClick = () => {
    setImportError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseTextReplacementXml(text);
        prepareImportPreview(parsed, file.name);
        setImportError('');
      } catch (error) {
        console.warn('Failed to import xml file', error);
        setImportError('Failed to parse XML file. Ensure it matches the expected plist format.');
      } finally {
        event.target.value = '';
      }
    },
    [prepareImportPreview]
  );

  const handleExport = () => {
    const xml = exportEntriesAsXml();
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TextReplacement_export.xml';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full flex-col gap-8 px-4 pb-12">
      <header className="max-w-4xl space-y-3">
        <h2 className="text-3xl font-semibold tracking-wide text-slate-100 sm:text-4xl">
          Text Replacement Manager
        </h2>
        <p className="text-base text-slate-300 sm:text-lg">
          Parse and curate shortcut → phrase pairs, track changes locally, and keep a
          full edit history. Use Import to preview XML differences before merging.
        </p>
        <p className="text-xs text-slate-500">
          Current entries stored: {entries.length}.
        </p>
      </header>

      <TextReplacementToolbar
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchTermChange={setSearchTerm}
        onSortByChange={(value: SortBy) => setSortBy(value)}
        onSortOrderToggle={toggleSortOrder}
        onAddClick={openNewEntryDialog}
        onImportClick={handleImportClick}
        onExportClick={handleExport}
      />

      {importError ? (
        <p role="alert" className="rounded-2xl border border-rose-500/70 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {importError}
        </p>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <TextReplacementTable
            entries={visibleEntries}
            onEdit={openEditDialog}
            onDelete={deleteEntry}
          />
        </div>
        <HistoryPanel historyEntries={historyEntries} onUndo={undoHistory} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        className="hidden"
        aria-label="Import XML file"
        onChange={handleFileChange}
      />

      <EditDialog
        isOpen={dialogState.isOpen}
        title={dialogState.entry ? 'Edit entry' : 'New entry'}
        initialShortcut={dialogState.entry?.shortcut ?? ''}
        initialPhrase={dialogState.entry?.phrase ?? ''}
        onSave={handleDialogSave}
        onDismiss={closeDialog}
      />

      <ImportPreviewDrawer
        preview={importPreview}
        onClose={cancelImportPreview}
        onToggleItem={toggleImportSelection}
        onSelectAll={selectAllImportItems}
        onConfirm={confirmImportSelection}
      />
    </section>
  );
}
