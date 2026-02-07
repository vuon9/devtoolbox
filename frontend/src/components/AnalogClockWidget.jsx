import React from 'react';

/**
 * Analog Clock Widget Component
 * Displays an SVG-based analog clock face
 */
export default function AnalogClockWidget({ date }) {
  if (!date) return null;

  const currentDate = new Date(date);
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  // Calculate angles
  const hourAngle = ((hours % 12) + minutes / 60) * 30; // 360 / 12 = 30
  const minuteAngle = (minutes + seconds / 60) * 6; // 360 / 60 = 6
  const secondAngle = seconds * 6;

  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;

  // Generate hour markers
  const hourMarkers = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x1 = center + (radius - 15) * Math.cos(angle);
    const y1 = center + (radius - 15) * Math.sin(angle);
    const x2 = center + (radius - 5) * Math.cos(angle);
    const y2 = center + (radius - 5) * Math.sin(angle);
    
    hourMarkers.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--cds-text-primary)"
        strokeWidth={i % 3 === 0 ? 3 : 1}
      />
    );
  }

  // Generate minute markers
  const minuteMarkers = [];
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue; // Skip hour positions
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const x1 = center + (radius - 8) * Math.cos(angle);
    const y1 = center + (radius - 8) * Math.sin(angle);
    const x2 = center + (radius - 5) * Math.cos(angle);
    const y2 = center + (radius - 5) * Math.sin(angle);
    
    minuteMarkers.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--cds-text-secondary)"
        strokeWidth={1}
      />
    );
  }

  // Calculate hand positions
  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.7;
  const secondHandLength = radius * 0.85;

  const hourX = center + hourHandLength * Math.cos((hourAngle - 90) * (Math.PI / 180));
  const hourY = center + hourHandLength * Math.sin((hourAngle - 90) * (Math.PI / 180));
  
  const minuteX = center + minuteHandLength * Math.cos((minuteAngle - 90) * (Math.PI / 180));
  const minuteY = center + minuteHandLength * Math.sin((minuteAngle - 90) * (Math.PI / 180));
  
  const secondX = center + secondHandLength * Math.cos((secondAngle - 90) * (Math.PI / 180));
  const secondY = center + secondHandLength * Math.sin((secondAngle - 90) * (Math.PI / 180));

  // Format digital time
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const displaySeconds = seconds.toString().padStart(2, '0');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      background: 'var(--cds-layer)',
      borderRadius: '4px',
      padding: '1rem',
      minWidth: '200px',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clock face */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="var(--cds-background)"
          stroke="var(--cds-border-strong)"
          strokeWidth={2}
        />

        {/* Hour markers */}
        {hourMarkers}

        {/* Minute markers */}
        {minuteMarkers}

        {/* Hour hand */}
        <line
          x1={center}
          y1={center}
          x2={hourX}
          y2={hourY}
          stroke="var(--cds-text-primary)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={center}
          y1={center}
          x2={minuteX}
          y2={minuteY}
          stroke="var(--cds-text-primary)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1={center}
          y1={center}
          x2={secondX}
          y2={secondY}
          stroke="var(--cds-support-error)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={4}
          fill="var(--cds-text-primary)"
        />
      </svg>

      {/* Digital display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--cds-text-primary)',
        }}>
          {displayHours}:{displayMinutes}:{displaySeconds}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--cds-text-secondary)',
        }}>
          {ampm}
        </div>
      </div>
    </div>
  );
}
