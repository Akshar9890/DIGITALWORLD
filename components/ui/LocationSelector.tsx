"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Globe, MapPin, Building2, Check, Search, X } from "lucide-react";
import { COUNTRIES, INDIAN_STATES, getCitiesForState } from "@/lib/data/india-locations";

interface LocationSelectorProps {
  country?: string;
  state?: string;
  city?: string;
  onCountryChange?: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  stateError?: string;
  cityError?: string;
  countryError?: string;
  disabled?: boolean;
  showCountry?: boolean;
  className?: string;
}

export function LocationSelector({
  country = "India",
  state = "",
  city = "",
  onCountryChange,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
  countryError,
  disabled = false,
  showCountry = true,
  className = "",
}: LocationSelectorProps) {
  // Dropdown open states
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Search filters
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // Custom city input if "Other" is chosen
  const [isCustomCity, setIsCustomCity] = useState(false);

  // Refs for click outside
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered lists
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return INDIAN_STATES;
    return INDIAN_STATES.filter((s) =>
      s.state.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

  const availableCities = useMemo(() => {
    return getCitiesForState(state);
  }, [state]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return availableCities;
    return availableCities.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [availableCities, citySearch]);

  const handleSelectState = (selectedState: string) => {
    onStateChange(selectedState);
    setStateOpen(false);
    setStateSearch("");
    
    // Check if current city belongs to the new state; if not, reset or pick top city
    const newCities = getCitiesForState(selectedState);
    if (!newCities.includes(city) && !isCustomCity) {
      onCityChange("");
    }
  };

  const handleSelectCity = (selectedCity: string) => {
    if (selectedCity === "Other") {
      setIsCustomCity(true);
      onCityChange("");
    } else {
      setIsCustomCity(false);
      onCityChange(selectedCity);
    }
    setCityOpen(false);
    setCitySearch("");
  };

  return (
    <div className={`grid grid-cols-1 ${showCountry ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 ${className}`}>
      {/* ── Country Dropdown ─────────────────────────────────── */}
      {showCountry && (
        <div className="flex flex-col gap-1 relative" ref={countryRef}>
          <label className="input-label flex items-center gap-1.5">
            <Globe size={14} className="text-tertiary" /> Country / Region *
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setCountryOpen(!countryOpen);
              setStateOpen(false);
              setCityOpen(false);
            }}
            className={`input-field w-full flex items-center justify-between text-left py-2.5 px-3.5 ${
              countryError ? "border-status-error" : ""
            } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-outline-variant/60"}`}
          >
            <span className="truncate text-white font-medium flex items-center gap-2">
              <span>{COUNTRIES.find((c) => c.name === country)?.flag || "🇮🇳"}</span>
              <span>{country || "Select Country"}</span>
            </span>
            <ChevronDown size={16} className={`text-slate-gray transition-transform ${countryOpen ? "rotate-180" : ""}`} />
          </button>

          {countryError && <span className="input-error text-xs">{countryError}</span>}

          {/* Country Dropdown Menu */}
          {countryOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 z-50 overflow-hidden shadow-2xl glass-dropdown animate-fade-in"
              style={{
                background: "rgba(25, 25, 27, 0.70)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                borderRadius: "12px",
              }}
            >
              {/* Search Box */}
              <div className="p-2 border-b border-white/10 bg-white/[0.03] flex items-center gap-2">
                <Search size={14} className="text-slate-gray" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="bg-transparent text-xs text-white placeholder-slate-gray focus:outline-none w-full"
                  autoFocus
                />
                {countrySearch && (
                  <button type="button" onClick={() => setCountrySearch("")} className="text-slate-gray hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Country List */}
              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-white/[0.04]">
                {filteredCountries.map((c) => {
                  const isSelected = c.name.toLowerCase() === country.toLowerCase();
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCountryChange?.(c.name);
                        setCountryOpen(false);
                        setCountrySearch("");
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all duration-150 ${
                        isSelected
                          ? "text-white font-semibold"
                          : "text-white/90 hover:bg-white/[0.07]"
                      }`}
                      style={
                        isSelected
                          ? {
                              background: "rgba(180, 40, 30, 0.18)",
                              borderLeft: "2px solid #B32418",
                            }
                          : {}
                      }
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      {isSelected && <Check size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
                {filteredCountries.length === 0 && (
                  <div className="p-3 text-xs text-slate-gray text-center">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── State / Province Dropdown ─────────────────────────── */}
      <div className="flex flex-col gap-1 relative" ref={stateRef}>
        <label className="input-label flex items-center gap-1.5">
          <MapPin size={14} className="text-tertiary" /> State / Province *
        </label>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setStateOpen(!stateOpen);
            setCountryOpen(false);
            setCityOpen(false);
          }}
          className={`input-field w-full flex items-center justify-between text-left py-2.5 px-3.5 ${
            stateError ? "border-status-error" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-outline-variant/60"}`}
        >
          <span className="truncate text-white font-medium">
            {state || "Select State / Province"}
          </span>
          <ChevronDown size={16} className={`text-slate-gray transition-transform ${stateOpen ? "rotate-180" : ""}`} />
        </button>

        {stateError && <span className="input-error text-xs">{stateError}</span>}

        {/* State Dropdown Menu */}
        {stateOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-50 overflow-hidden shadow-2xl glass-dropdown animate-fade-in"
            style={{
              background: "rgba(25, 25, 27, 0.70)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
              borderRadius: "12px",
            }}
          >
            {/* Search Box */}
            <div className="p-2 border-b border-white/10 bg-white/[0.03] flex items-center gap-2">
              <Search size={14} className="text-slate-gray" />
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search state (e.g. Gujarat, Maharashtra)..."
                className="bg-transparent text-xs text-white placeholder-slate-gray focus:outline-none w-full"
                autoFocus
              />
              {stateSearch && (
                <button type="button" onClick={() => setStateSearch("")} className="text-slate-gray hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* State List */}
            <div className="max-h-60 overflow-y-auto py-1 divide-y divide-white/[0.04]">
              {filteredStates.map((s) => {
                const isSelected = s.state.toLowerCase() === state.toLowerCase();
                return (
                  <button
                    key={s.state}
                    type="button"
                    onClick={() => handleSelectState(s.state)}
                    className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all duration-150 ${
                      isSelected
                        ? "text-white font-semibold"
                        : "text-white/90 hover:bg-white/[0.07]"
                    }`}
                    style={
                      isSelected
                        ? {
                            background: "rgba(180, 40, 30, 0.18)",
                            borderLeft: "2px solid #B32418",
                          }
                        : {}
                    }
                  >
                    <span>{s.state}</span>
                    <span className="text-[10px] font-mono text-slate-gray">GST: {s.gstCode}</span>
                  </button>
                );
              })}
              {filteredStates.length === 0 && (
                <div className="p-3 text-xs text-slate-gray text-center">No states found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── City / District Dropdown ──────────────────────────── */}
      <div className="flex flex-col gap-1 relative" ref={cityRef}>
        <label className="input-label flex items-center gap-1.5">
          <Building2 size={14} className="text-tertiary" /> City / District *
        </label>

        {!isCustomCity ? (
          <>
            <button
              type="button"
              disabled={disabled || !state}
              onClick={() => {
                if (!state) return;
                setCityOpen(!cityOpen);
                setCountryOpen(false);
                setStateOpen(false);
              }}
              className={`input-field w-full flex items-center justify-between text-left py-2.5 px-3.5 ${
                cityError ? "border-status-error" : ""
              } ${
                disabled || !state
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:border-outline-variant/60"
              }`}
            >
              <span className="truncate text-white font-medium">
                {city || (state ? "Select City" : "Select state first")}
              </span>
              <ChevronDown size={16} className={`text-slate-gray transition-transform ${cityOpen ? "rotate-180" : ""}`} />
            </button>

            {/* City Dropdown Menu */}
            {cityOpen && state && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 z-50 overflow-hidden shadow-2xl glass-dropdown animate-fade-in"
                style={{
                  background: "rgba(25, 25, 27, 0.70)",
                  backdropFilter: "blur(18px) saturate(140%)",
                  WebkitBackdropFilter: "blur(18px) saturate(140%)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                  borderRadius: "12px",
                }}
              >
                {/* Search Box */}
                <div className="p-2 border-b border-white/10 bg-white/[0.03] flex items-center gap-2">
                  <Search size={14} className="text-slate-gray" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder={`Search cities in ${state}...`}
                    className="bg-transparent text-xs text-white placeholder-slate-gray focus:outline-none w-full"
                    autoFocus
                  />
                  {citySearch && (
                    <button type="button" onClick={() => setCitySearch("")} className="text-slate-gray hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* City List */}
                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-white/[0.04]">
                  {filteredCities.map((c) => {
                    const isSelected = c.toLowerCase() === city.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all duration-150 ${
                          isSelected
                            ? "text-white font-semibold"
                            : "text-white/90 hover:bg-white/[0.07]"
                        }`}
                        style={
                          isSelected
                            ? {
                                background: "rgba(180, 40, 30, 0.18)",
                                borderLeft: "2px solid #B32418",
                              }
                            : {}
                        }
                      >
                        <span>{c}</span>
                        {isSelected && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredCities.length === 0 && (
                    <div className="p-3 text-xs text-slate-gray text-center">
                      City not listed?{" "}
                      <button
                        type="button"
                        onClick={() => handleSelectCity("Other")}
                        className="text-tertiary font-bold underline ml-1"
                      >
                        Type custom city
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Enter your city name"
              className={`input-field w-full pr-8 ${cityError ? "border-status-error" : ""}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsCustomCity(false);
                onCityChange("");
              }}
              title="Switch back to city list"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-gray hover:text-tertiary"
            >
              List
            </button>
          </div>
        )}

        {cityError && <span className="input-error text-xs">{cityError}</span>}
      </div>
    </div>
  );
}
