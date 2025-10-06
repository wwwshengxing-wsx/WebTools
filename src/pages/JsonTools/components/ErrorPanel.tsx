interface ErrorPanelProps {
  message: string;
}

export function ErrorPanel({ message }: ErrorPanelProps): JSX.Element {
  return (
    <div className="h-full rounded-lg border border-rose-600/70 bg-rose-950/40 p-6 text-sm text-rose-200 shadow-inner shadow-rose-950/60">
      <h3 className="text-base font-semibold text-rose-200">解析失败</h3>
      <p className="mt-2 leading-relaxed text-rose-100/90">{message}</p>
    </div>
  );
}
