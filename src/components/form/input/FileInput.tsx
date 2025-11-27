import { FC } from "react";

interface FileInputProps {
  id?: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

const FileInput: FC<FileInputProps> = ({ id, className, onChange, accept }) => {
  return (
    <input
      id={id}
      type="file"
      accept={accept}
      className={`h-11 rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors appearance-none px-4 py-2.5 file:mr-4 file:border-0 file:bg-transparent file:py-0 file:px-0 file:text-sm file:text-gray-700 file:cursor-pointer focus:outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:file:text-gray-400 dark:focus:border-brand-800 ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;
