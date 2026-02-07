import React from 'react';

/**
 * Calendar Widget Component
 * Displays a mini calendar with the selected date highlighted
 */
export default function CalendarWidget({ date, onDateSelect }) {
  if (!date) return null;

  const currentDate = new Date(date);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days
  const days = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }
  
  // Current month days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear();
    const isSelected = i === day;
    
    days.push({
      day: i,
      currentMonth: true,
      isToday,
      isSelected,
    });
  }
  
  // Next month days to fill the grid
  const remainingCells = 42 - days.length; // 6 rows * 7 columns
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      currentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }

  const handleDayClick = (dayInfo, index) => {
    if (!dayInfo.currentMonth || !onDateSelect) return;
    
    // Calculate the actual date
    const clickedDate = new Date(year, month, dayInfo.day);
    onDateSelect(clickedDate);
  };

  const goToPrevMonth = () => {
    if (onDateSelect) {
      const newDate = new Date(year, month - 1, day);
      onDateSelect(newDate);
    }
  };

  const goToNextMonth = () => {
    if (onDateSelect) {
      const newDate = new Date(year, month + 1, day);
      onDateSelect(newDate);
    }
  };

  return (
    <div style={{
      background: 'var(--cds-layer)',
      borderRadius: '4px',
      padding: '1rem',
      minWidth: '280px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <button
          onClick={goToPrevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            color: 'var(--cds-text-primary)',
            fontSize: '1rem',
          }}
        >
          ‹
        </button>
        
        <div style={{
          fontWeight: 600,
          fontSize: '1rem',
        }}>
          {monthNames[month]} {year}
        </div>
        
        <button
          onClick={goToNextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            color: 'var(--cds-text-primary)',
            fontSize: '1rem',
          }}
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        marginBottom: '0.5rem',
      }}>
        {dayNames.map((name) => (
          <div
            key={name}
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--cds-text-secondary)',
              padding: '0.25rem',
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
      }}>
        {days.map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(dayInfo, index)}
            style={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '4px',
              cursor: dayInfo.currentMonth ? 'pointer' : 'default',
              background: dayInfo.isSelected 
                ? 'var(--cds-button-primary)' 
                : dayInfo.isToday 
                  ? 'var(--cds-layer-hover)' 
                  : 'transparent',
              color: dayInfo.isSelected 
                ? 'var(--cds-button-primary-text)' 
                : dayInfo.currentMonth 
                  ? 'var(--cds-text-primary)' 
                  : 'var(--cds-text-disabled)',
              fontSize: '0.875rem',
              fontWeight: dayInfo.isToday || dayInfo.isSelected ? 600 : 400,
            }}
          >
            {dayInfo.day}
          </button>
        ))}
      </div>

      {/* Selected date display */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--cds-border-subtle)',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--cds-text-secondary)',
      }}>
        Selected: {currentDate.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
}
