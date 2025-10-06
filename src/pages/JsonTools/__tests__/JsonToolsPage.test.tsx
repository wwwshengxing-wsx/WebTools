import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import JsonToolsPage from '../index';

declare global {
  interface Navigator {
    clipboard?: {
      writeText: (text: string) => Promise<void>;
    };
  }
}

describe('JsonToolsPage', () => {
  const originalClipboard = navigator.clipboard;
  const writeTextMock = vi.fn(async (_text: string) => undefined);

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
  });

  afterAll(() => {
    if (originalClipboard) {
      navigator.clipboard = originalClipboard;
    } else {
      // @ts-expect-error - jsdom allows deleting the mocked clipboard
      delete navigator.clipboard;
    }
  });

  beforeEach(() => {
    writeTextMock.mockClear();
  });

  it('renders default sample JSON tree', async () => {
    render(<JsonToolsPage />);
    expect(screen.getByText('JSON 工具')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('currency')).toBeInTheDocument();
      expect(screen.getByText('"MYR"')).toBeInTheDocument();
    });
  });

  it('shows error panel when JSON parsing fails', async () => {
    vi.useFakeTimers();
    render(<JsonToolsPage />);
    const textarea = screen.getByLabelText('JSON 输入');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '{"foo": }');
    act(() => {
      vi.advanceTimersByTime(400);
    });
    await screen.findByText('解析失败');
    vi.useRealTimers();
  });

  it('formats JSON when clicking the format button', async () => {
    render(<JsonToolsPage />);
    const textarea = screen.getByLabelText('JSON 输入');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '{"a":1,"b":2}');
    await userEvent.click(screen.getByRole('button', { name: '格式化 JSON' }));
    expect(textarea).toHaveValue('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('toggles escape preservation for clipboard output', async () => {
    render(<JsonToolsPage />);
    const textarea = screen.getByLabelText('JSON 输入');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '{"text":"line\\nbreak"}');
    await userEvent.click(screen.getByRole('button', { name: '格式化 JSON' }));
    await userEvent.click(screen.getByRole('button', { name: '复制 JSON' }));
    expect(writeTextMock).toHaveBeenCalled();
    const preserved = writeTextMock.mock.calls[0][0];
    expect(preserved).toContain('\\n');

    await userEvent.click(screen.getByLabelText('保留转义字符'));
    writeTextMock.mockClear();
    await userEvent.click(screen.getByRole('button', { name: '复制 JSON' }));
    expect(writeTextMock).toHaveBeenCalled();
    const unescaped = writeTextMock.mock.calls[0][0];
    expect(unescaped).toContain('line\nbreak');
    expect(unescaped).not.toContain('\\n');
  });
});
