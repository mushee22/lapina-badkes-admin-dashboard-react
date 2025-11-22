import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "../../icons";

interface Option {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
}) => {
  const isControlled = value !== undefined;
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with controlled value prop
  useEffect(() => {
    if (isControlled && value !== undefined) {
      setSelectedValue(value);
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      } else {
        setSearchTerm("");
      }
    }
  }, [value, isControlled, options]);

  // Sync internal state with defaultValue prop changes
  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setSelectedValue(defaultValue);
      const selectedOption = options.find((opt) => opt.value === defaultValue);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      } else {
        setSearchTerm("");
      }
    }
  }, [defaultValue, isControlled, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
        // Reset search term to selected option label if dropdown closes
        if (selectedValue) {
          const selectedOption = options.find((opt) => opt.value === selectedValue);
          if (selectedOption) {
            setSearchTerm(selectedOption.label);
          }
        } else {
          setSearchTerm("");
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, selectedValue, options]);

  // Always show the "All" option (empty value) at the top if it exists, then filter other options
  const allOption = options.find((opt) => opt.value === "");
  const otherOptions = options.filter((opt) => opt.value !== "");
  const filteredOtherOptions = otherOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Combine: "All" option first (if exists and matches search or search is empty), then filtered options
  const filteredOptions = [
    ...(allOption && (searchTerm === "" || allOption.label.toLowerCase().includes(searchTerm.toLowerCase()))
      ? [allOption]
      : []),
    ...filteredOtherOptions,
  ];

  const handleSelect = (optionValue: string) => {
    if (!isControlled) {
      setSelectedValue(optionValue);
    }
    const selectedOption = options.find((opt) => opt.value === optionValue);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(optionValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    setFocusedIndex(-1);
    
    // Clear selection if search doesn't match current selection
    if (selectedValue) {
      const selectedOption = options.find((opt) => opt.value === selectedValue);
      if (selectedOption && !selectedOption.label.toLowerCase().includes(newSearchTerm.toLowerCase())) {
        if (!isControlled) {
          setSelectedValue("");
        }
        onChange("");
      }
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Clear search term when opening to show all options
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        if (selectedValue) {
          const selectedOption = options.find((opt) => opt.value === selectedValue);
          if (selectedOption) {
            setSearchTerm(selectedOption.label);
          }
        } else {
          setSearchTerm("");
        }
        inputRef.current?.blur();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const currentValue = isControlled ? value : selectedValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const displayValue = isOpen ? searchTerm : selectedOption?.label || searchTerm || "";

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
            currentValue
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-400"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute left-0 z-40 w-full mt-1 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 max-h-60"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={option.value}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    isFocused
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  } ${
                    isSelected
                      ? "bg-primary/5 dark:bg-primary/10 font-medium"
                      : ""
                  } ${
                    index === 0 ? "rounded-t-lg" : ""
                  } ${
                    index === filteredOptions.length - 1 ? "rounded-b-lg" : ""
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="text-gray-800 dark:text-white/90">
                    {option.label}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;

