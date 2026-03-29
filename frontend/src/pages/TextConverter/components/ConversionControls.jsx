import React from 'react';
import { CONVERTER_MAP } from '../constants';

// Inline-styled Select component
function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === SelectContent) {
          return isOpen
            ? React.cloneElement(child, {
                onSelect: (val) => {
                  onValueChange(val);
                  setIsOpen(false);
                },
              })
            : null;
        }
        return child;
      })}
    </div>
  );
}

function SelectTrigger({ children, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '32px',
        padding: '0 12px',
        backgroundColor: isOpen ? '#27272a' : '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#f4f4f5',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
        e.currentTarget.style.borderColor = '#52525b';
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.backgroundColor = '#18181b';
          e.currentTarget.style.borderColor = '#3f3f46';
        }
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          marginLeft: '8px',
          opacity: 0.7,
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.15s ease',
        }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function SelectValue({ children }) {
  return <>{children}</>;
}

function SelectContent({ children, onSelect }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '4px',
        backgroundColor: '#1c1917',
        border: '1px solid #27272a',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        zIndex: 50,
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      {React.Children.map(children, (child) => React.cloneElement(child, { onSelect }))}
    </div>
  );
}

function SelectItem({ children, value, onSelect }) {
  return (
    <div
      onClick={() => onSelect(value)}
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        color: '#a1a1aa',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
        e.currentTarget.style.color = '#f4f4f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#a1a1aa';
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, style = {} }) {
  return (
    <label
      style={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#71717a',
        display: 'block',
        marginBottom: '6px',
        ...style,
      }}
    >
      {children}
    </label>
  );
}

export default function ConversionControls({ category, setCategory, method, setMethod }) {
  const categories = Object.keys(CONVERTER_MAP);
  const methods = CONVERTER_MAP[category] || [];

  return (
    <>
      <div style={{ width: '180px' }}>
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setMethod(CONVERTER_MAP[value][0]);
          }}
        >
          <SelectTrigger>
            <SelectValue>{category}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div style={{ width: '280px' }}>
        <Label>Algorithm / Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue>{method}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {methods.map((meth) => (
              <SelectItem key={meth} value={meth}>
                {meth}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
