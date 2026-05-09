import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const ErrorMessage = ({ error }) =>
  error ? (
    <div className="flex items-center gap-2 rounded p-2 text-sm text-destructive shrink-0"
      style={{ backgroundColor: 'rgb(from var(--destructive) r g b / 0.1)' }}
    >
      <XCircle className="text-destructive" size={16} />
      {error}
    </div>
  ) : null;

export const SuccessMessage = ({ isValid }) =>
  isValid === true ? (
    <div className="flex items-center gap-2 rounded p-2 text-sm shrink-0"
      style={{ backgroundColor: 'rgb(from var(--success) r g b / 0.1)', color: 'var(--success)' }}
    >
      <CheckCircle className="text-success" size={16} />
      Valid JWT structure
    </div>
  ) : null;
