"use client";

import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: (SelectOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

export function CustomSelect({
  options: rawOptions,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  disabled = false,
  searchable,
  required = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  name,
  id: customId,
  "aria-label": ariaLabel,
  renderOption,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;

  // Normalize options
  const options: SelectOption[] = useMemo(() => {
    return rawOptions.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [rawOptions]);

  // Value state (controlled vs uncontrolled)
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || (options[0] && !placeholder ? options[0].value : "")
  );
  const currentValue = isControlled ? controlledValue : internalValue;

  // Open state & search query
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Position detection (open upwards if near viewport bottom)
  const [openUpwards, setOpenUpwards] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search for long lists unless explicitly set
  const isSearchable = searchable !== undefined ? searchable : options.length > 8;

  // Filtered options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  // Current selected option object
  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Adjust menu direction (upwards vs downwards) based on viewport
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }

      // Auto-focus search input if searchable
      if (isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      // Set initial highlighted index to selected option
      const selIdx = filteredOptions.findIndex(
        (o) => o.value === currentValue
      );
      setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, currentValue, filteredOptions, isSearchable]);

  const selectOption = (opt: SelectOption) => {
    if (opt.disabled) return;
    if (!isControlled) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value);
    setIsOpen(false);
    setSearchQuery("");
    triggerRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        } else if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          e.preventDefault();
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (
              next < filteredOptions.length &&
              filteredOptions[next]?.disabled
            ) {
              next++;
            }
            return next < filteredOptions.length ? next : prev;
          });
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && filteredOptions[next]?.disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      case "Home":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case "End":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1 w-full text-left ${className}`}
    >
      {/* Hidden input for HTML form submissions / FormData */}
      {name && <input type="hidden" name={name} value={currentValue} />}

      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="input-label flex items-center justify-between text-xs font-medium text-white/80"
        >
          <span>
            {label} {required && <span className="text-status-error">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
          disabled
            ? "bg-surface-container/50 border border-outline-variant/15 text-slate-gray cursor-not-allowed opacity-60"
            : "bg-surface-container border border-white/10 hover:border-white/20 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/40 cursor-pointer shadow-sm"
        } ${error ? "border-status-error focus:border-status-error" : ""} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-tertiary">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate ${
              selectedOption
                ? "text-white/90 font-medium"
                : "text-slate-gray"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-gray transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Error Message */}
      {error && <span className="input-error text-xs text-status-error mt-0.5">{error}</span>}

      {/* ── Glassmorphic Dropdown Popover Menu ────────────────── */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          aria-label={label || placeholder}
          className={`absolute left-0 right-0 z-50 overflow-hidden shadow-2xl glass-dropdown animate-fade-in ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${menuClassName}`}
          style={{
            background: "rgba(25, 25, 27, 0.70)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
            borderRadius: "12px",
          }}
        >
          {/* Optional Search Bar */}
          {isSearchable && (
            <div className="p-2 border-b border-white/10 bg-white/[0.03] flex items-center gap-2">
              <Search size={14} className="text-slate-gray shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search options..."
                className="bg-transparent text-xs text-white placeholder-slate-gray focus:outline-none w-full py-1"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="text-slate-gray hover:text-white mr-1"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-white/[0.04]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === currentValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`glass-dropdown-option cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? "selected"
                        : isHighlighted
                        ? "highlighted"
                        : ""
                    } ${
                      option.disabled
                        ? "opacity-40 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                    style={
                      isSelected
                        ? {
                            background: "rgba(180, 40, 30, 0.18)",
                            color: "#ffffff",
                            fontWeight: 600,
                            borderLeft: "2px solid #B32418",
                          }
                        : isHighlighted
                        ? { background: "rgba(255, 255, 255, 0.07)" }
                        : {}
                    }
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2.5 truncate">
                        {option.icon && (
                          <span className="shrink-0">{option.icon}</span>
                        )}
                        <div className="flex flex-col truncate">
                          <span className="truncate text-xs text-white/90">
                            {option.label}
                          </span>
                          {option.sublabel && (
                            <span className="text-[10px] text-white/55 font-mono truncate">
                              {option.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-primary" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 px-3 text-center text-xs text-slate-gray">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
