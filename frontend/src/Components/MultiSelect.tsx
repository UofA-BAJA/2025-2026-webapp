import { useState, useRef, useEffect } from "react";

type Option = { label: string; value: string };

interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (selected: string[]) => void;
}

export default function MultiSelect({ options, placeholder = "Select…", onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.value));
  const someSelected = filtered.some(o => selected.has(o.value));

  const toggle = (value: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      onChange?.([...next]);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach(o => next.delete(o.value));
      } else {
        filtered.forEach(o => next.add(o.value));
      }
      onChange?.([...next]);
      return next;
    });
  };

  const clear = () => { setSelected(new Set()); onChange?.([]); };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label =
    selected.size === 0 ? placeholder
      : selected.size === options.length ? "All selected"
        : selected.size === 1 ? options.find(o => selected.has(o.value))?.label
          : `${selected.size} selected`;

  return (
    <div ref={containerRef} style={{ position: "relative", width: 300 }}>

      <button onClick={() => setOpen(o => !o)}>
        {label} ▾
      </button>

      {open && (
        <div className="dropdown">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
          />

          <ul>
            {/* Select All row */}
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleAll}
                />
                Select all
              </label>
            </li>

            {filtered.length === 0 && <li>No results</li>}

            {filtered.map(opt => (
              <li key={opt.value}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.has(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>

          <footer>
            <span>{selected.size} selected</span>
            <button onClick={clear}>Clear</button>
          </footer>
        </div>
      )}
    </div>
  );
}