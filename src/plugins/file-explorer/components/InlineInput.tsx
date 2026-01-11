import { useState, useRef, useEffect } from 'react';
import { Folder, File } from 'lucide-react';

export type InlineInputType = 'new-file' | 'new-folder' | 'rename';

interface InlineInputProps {
  type: InlineInputType;
  initialValue: string;
  level: number;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const FOLDER_COLOR = '#dcb67a';

export function InlineInput({ type, initialValue, level, onSubmit, onCancel }: InlineInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSubmit(value);
    } else {
      onCancel();
    }
  };

  const icon = type === 'new-folder' ? (
    <Folder size={16} strokeWidth={1.5} color={FOLDER_COLOR} />
  ) : (
    <File size={16} strokeWidth={1.5} className="text-fg-secondary" />
  );

  return (
    <div
      className="flex items-center gap-1.5 py-0.5 px-2"
      style={{ paddingLeft: `${level * 16 + 8}px` }}
    >
      <span className="flex items-center justify-center shrink-0 w-4 h-4">
        {icon}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex-1 min-w-0 px-1 py-0 text-sm bg-secondary border border-accent rounded outline-none"
        placeholder={type === 'new-folder' ? 'folder name' : 'file name'}
      />
    </div>
  );
}
