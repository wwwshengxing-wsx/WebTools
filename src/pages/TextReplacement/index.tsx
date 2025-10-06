import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import TextReplacementToolbar from './components/TextReplacementToolbar';
import TextReplacementTable from './components/TextReplacementTable';
import EditDialog from './components/EditDialog';
import ImportPreviewDrawer from './components/ImportPreviewDrawer';
import HistoryPanel from './components/HistoryPanel';
import ComparisonDrawer from './components/ComparisonDrawer';
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
    comparisonPreview,
    availableTags,
    selectedTags,
    selectionMode,
    selectedEntryIds,
    setSearchTerm,
    setSortBy,
    toggleSortOrder,
    toggleTagFilter,
    clearTagFilters,
    toggleSelectionMode,
    toggleEntrySelection,
    selectAllVisibleEntries,
    clearSelection,
    saveEntry,
    deleteEntry,
    deleteSelectedEntries,
    addTagToSelectedEntries,
    prepareImportPreview,
    toggleImportSelection,
    selectAllImportItems,
    confirmImportSelection,
    cancelImportPreview,
    undoHistory,
    exportEntriesAsXml,
    clearAllEntries,
    prepareComparisonPreview,
    closeComparisonPreview,
    addComparisonEntry,
    applyComparisonEntry,
    removeComparisonEntry,
  } = useTextReplacementEntries();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const compareInputRef = useRef<HTMLInputElement | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    entry: TextReplacementEntry | null;
  }>({ isOpen: false, entry: null });
  const [importError, setImportError] = useState('');
  const [compareError, setCompareError] = useState('');

  const openNewEntryDialog = () => {
        setDialogState({ isOpen: true, entry: null });
  };

  const openEditDialog = (entry: TextReplacementEntry) => {
    setDialogState({ isOpen: true, entry });
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, entry: null });
  };

  const handleDialogSave = (values: { shortcut: string; phrase: string; tags: string[] }) => {
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

  const handleCompareClick = () => {
    setCompareError('');
    compareInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;

      void (async () => {
        try {
          const text = await file.text();
          const parsed = parseTextReplacementXml(text);
          prepareImportPreview(parsed, file.name);
          setImportError('');
        } catch (error) {
          console.warn('Failed to import xml file', error);
          setImportError('Failed to parse XML file. Ensure it matches the expected plist format.');
        } finally {
          input.value = '';
        }
      })();
    },
    [prepareImportPreview]
  );

  const handleCompareFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;

      void (async () => {
        try {
          const text = await file.text();
          const parsed = parseTextReplacementXml(text);
          prepareComparisonPreview(parsed, file.name);
          setCompareError('');
        } catch (error) {
          console.warn('Failed to compare xml file', error);
          setCompareError('Failed to parse XML file for comparison. Ensure it matches the expected plist format.');
        } finally {
          input.value = '';
        }
      })();
    },
    [prepareComparisonPreview]
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

  const handleClearAll = () => {
    const confirmed = window.confirm('This will remove all entries and history. Continue?');
    if (!confirmed) return;
    clearAllEntries();
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      if (!selectionMode) toggleSelectionMode(true);
      selectAllVisibleEntries();
    } else {
      clearSelection();
      toggleSelectionMode(false);
    }
  };

  const handleEntrySelectionToggle = (entryId: string) => {
    if (!selectionMode) toggleSelectionMode(true);
    toggleEntrySelection(entryId);
  };

  const handleDeleteSelected = () => {
    if (selectedEntryIds.length === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedEntryIds.length} selected entr${selectedEntryIds.length === 1 ? 'y' : 'ies'}?`
    );
    if (!confirmed) return;
    deleteSelectedEntries();
  };

  const handleAddTagToSelection = (tag: string) => {
    addTagToSelectedEntries(tag);
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
        availableTags={availableTags}
        selectedTags={selectedTags}
        selectionMode={selectionMode}
        selectedCount={selectedEntryIds.length}
        onSearchTermChange={setSearchTerm}
        onSortByChange={(value: SortBy) => setSortBy(value)}
        onSortOrderToggle={toggleSortOrder}
        onAddClick={openNewEntryDialog}
        onCompareClick={handleCompareClick}
        onImportClick={handleImportClick}
        onExportClick={handleExport}
        onTagToggle={toggleTagFilter}
        onClearTagFilters={clearTagFilters}
        onClearAll={handleClearAll}
        onToggleSelectionMode={toggleSelectionMode}
        onSelectAllVisible={selectAllVisibleEntries}
        onClearSelection={clearSelection}
        onDeleteSelected={handleDeleteSelected}
        onAddTagToSelection={handleAddTagToSelection}
      />

      <div className="space-y-3">
        {importError ? (
          <p
            role="alert"
            className="rounded-2xl border border-rose-500/70 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {importError}
          </p>
        ) : null}
        {compareError ? (
          <p
            role="alert"
            className="rounded-2xl border border-amber-500/70 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            {compareError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <TextReplacementTable
            entries={visibleEntries}
            selectionMode={selectionMode}
            selectedEntryIds={selectedEntryIds}
            onEdit={openEditDialog}
            onDelete={deleteEntry}
            onToggleEntrySelection={handleEntrySelectionToggle}
            onToggleSelectAll={handleToggleSelectAll}
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

      <input
        ref={compareInputRef}
        type="file"
        accept=".xml"
        className="hidden"
        aria-label="Compare XML file"
        onChange={handleCompareFileChange}
      />

      <EditDialog
        isOpen={dialogState.isOpen}
        title={dialogState.entry ? 'Edit entry' : 'New entry'}
        initialShortcut={dialogState.entry?.shortcut ?? ''}
        initialPhrase={dialogState.entry?.phrase ?? ''}
        initialTags={dialogState.entry?.tags ?? []}
        availableTags={availableTags}
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

      <ComparisonDrawer
        comparison={comparisonPreview}
        onClose={closeComparisonPreview}
        onAdd={addComparisonEntry}
        onApply={applyComparisonEntry}
        onRemove={removeComparisonEntry}
      />
    </section>
  );
}
