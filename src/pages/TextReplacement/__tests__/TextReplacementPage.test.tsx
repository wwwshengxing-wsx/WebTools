import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import TextReplacementPage from '..';

beforeEach(() => {
  window.localStorage.clear();
});

describe('TextReplacementPage', () => {
  it('allows creating and searching entries', async () => {
    render(<TextReplacementPage />);

    expect(screen.getByText('No entries yet')).toBeInTheDocument();

    const newEntryButtons = screen.getAllByText('New entry');
    fireEvent.click(newEntryButtons[newEntryButtons.length - 1]);

    const shortcutField = screen.getAllByLabelText('Shortcut').slice(-1)[0];
    const phraseField = screen.getAllByLabelText('Phrase').slice(-1)[0];
    fireEvent.change(shortcutField, { target: { value: 'hello' } });
    fireEvent.change(phraseField, { target: { value: 'Hello world' } });

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText('hello').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText('Search shortcut or phrase');
    fireEvent.change(searchInput, { target: { value: 'zzz' } });

    expect(screen.getByText('No entries yet')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'hello' } });

    await waitFor(() => {
      expect(screen.getByText('hello')).toBeInTheDocument();
    });
  });

  it('imports entries from an xml file and shows history', async () => {
    render(<TextReplacementPage />);

    const addButtons = screen.getAllByText('New entry');
    fireEvent.click(addButtons[addButtons.length - 1]);
    fireEvent.change(screen.getAllByLabelText('Shortcut').slice(-1)[0], {
      target: { value: 'base' },
    });
    fireEvent.change(screen.getAllByLabelText('Phrase').slice(-1)[0], {
      target: { value: 'Base phrase' },
    });
    const modalSaveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(modalSaveButtons[modalSaveButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText('base').length).toBeGreaterThan(0);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<array>\n  <dict>\n    <key>phrase</key>\n    <string>Updated base</string>\n    <key>shortcut</key>\n    <string>base</string>\n  </dict>\n  <dict>\n    <key>phrase</key>\n    <string>Another phrase</string>\n    <key>shortcut</key>\n    <string>another</string>\n  </dict>\n</array>\n</plist>`;

    const file = new File([xml], 'demo.xml', { type: 'text/xml' });
    const fileInput = screen.getByLabelText('Import XML file');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Confirm import').slice(-1)[0]);

    await waitFor(() => {
      expect(screen.queryAllByText('Import preview').length).toBe(0);
    });

    await waitFor(() => {
      expect(screen.getAllByText('another').length).toBeGreaterThan(0);
    });

    const historyHeading = screen.getAllByText('History').slice(-1)[0];
    expect(historyHeading).toBeInTheDocument();
    expect(screen.getByText(/Imported 2 entries from demo\.xml/)).toBeInTheDocument();
  });
});
