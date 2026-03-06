import { signal } from 'essor';

export interface ErrorInfo {
  type?: 'runtime' | 'compile' | 'console';
  message: string;
  stack?: string;
  line?: number;
  column?: number;
}

export function ErrorDisplay(props: { error: ErrorInfo | string | null; onClose?: () => void }) {
  if (!props.error || props.error === '') return null;

  const error = typeof props.error === 'string'
    ? { message: props.error }
    : props.error as ErrorInfo;

  const pos = signal({ x: 0, y: 0 });
  const isDragging = signal(false);
  let startPos = { x: 0, y: 0 };

  const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true;
    startPos = {
      x: e.clientX - pos.value.x,
      y: e.clientY - pos.value.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.value) return;
      pos.value = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      };
    };

    const handleMouseUp = () => {
      isDragging.value = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        transform: `translate(${pos.value.x}px, ${pos.value.y}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      class="absolute bottom-4 left-4 right-4 z-50 max-h-[80%] of-auto glass pa-4  rounded-xl shadow-2xl b-1 b-red-500/20 dark:b-red-400/20 animate-slide-up"
    >
      <div class="flex items-start gap-4">
        <div class="flex-auto overflow-hidden">
          <div
            onMouseDown={handleMouseDown}
            class="font-bold text-lg mb-2 flex items-center justify-between cursor-move select-none active:cursor-grabbing"
          >
            <div class="flex items-center gap-3">
              <span class={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${error.type === 'compile'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 b-1 b-amber-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 b-1 b-red-500/20'
                }`}>
                {error.type === 'compile' ? 'Compile Error' : 'Runtime Error'}
              </span>
              {error.line && (
                <span class="bg-red-500/10 px-2 py-0.5 rounded-md text-xs font-mono text-red-500 b-1 b-red-500/20">
                  L{error.line}:{error.column}
                </span>
              )}
            </div>

            <button
              onClick={props.onClose}
              class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/close"
            >
              <div class="i-carbon-close text-lg opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div class="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-red-500/5 p-3 rounded-lg b-1 b-red-500/10 mb-3">
            {error.message}
          </div>
          {error.stack && (
            <details class="group">
              <summary class="cursor-pointer text-[12px] font-semibold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 mt-4">
                <div class="i-carbon-chevron-right group-open:rotate-90 transition-transform" />
                Stack Trace
              </summary>
              <pre class="mt-3 of-auto text-[11px] bg-black/5 dark:bg-white/5 p-4 rounded-lg font-mono leading-tight opacity-80 border-t-1 border-white/5 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
