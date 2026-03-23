import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/cn';
import {
  Key,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Binary,
  Code2,
} from 'lucide-react';
import { Decode, Encode } from '../../generated/wails/jWTService';

export default function JwtDebugger() {
  const [jwt, setJwt] = useState('');
  const [payload, setPayload] = useState('');
  const [header, setHeader] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [activeMode, setActiveMode] = useState('decode');

  const handleDecode = async (token = jwt) => {
    if (!token.trim()) return;
    try {
      const res = await Decode(token);
      setPayload(JSON.stringify(res.payload, null, 2));
      setHeader(JSON.stringify(res.header, null, 2));
      setIsValid(res.valid);
      setError('');
    } catch (err) {
      setError(err.message || 'Invalid JWT format.');
      setPayload('');
      setHeader('');
      setIsValid(false);
    }
  };

  const handleEncode = async () => {
    try {
      const res = await Encode(JSON.parse(header), JSON.parse(payload));
      setJwt(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Encoding failed. Check JSON format.');
    }
  };

  useEffect(() => {
    if (jwt) handleDecode(jwt);
  }, [jwt]);

  const modes = [
    { id: 'decode', label: 'Decode', icon: Hash },
    { id: 'encode', label: 'Encode', icon: Binary },
  ];

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="JWT Debugger"
        description="Inspect, decode, and encode JSON Web Tokens. Verify signatures and visualize payload contents with ease."
      />

      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/40">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all',
                activeMode === mode.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <mode.icon className="h-3.5 w-3.5" />
              {mode.label}
            </button>
          ))}
        </div>

        {activeMode === 'encode' && (
          <Button
            onClick={handleEncode}
            size="sm"
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <Lock className="h-3.5 w-3.5" />
            Sign & Encode
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <ToolSplitPane>
          <div className="flex flex-col h-full space-y-4">
            <ToolPane
              label="Encoded Token"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              placeholder="Paste encoded JWT here..."
              className="flex-1"
            />
            {isValid !== null && (
              <div
                className={cn(
                  'p-3 rounded-lg border flex items-center gap-3',
                  isValid
                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                )}
              >
                {isValid ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div className="text-[11px] font-bold uppercase tracking-widest">
                  {isValid ? 'Signature Verified' : 'Invalid Signature / Format'}
                </div>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs italic">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col h-full space-y-4">
            <ToolPane
              label="Header (Algorithm & Type)"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              readOnly={activeMode === 'decode'}
              placeholder="{ 'alg': 'HS256', 'typ': 'JWT' }"
              className="h-1/3"
            />
            <ToolPane
              label="Payload (Data)"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              readOnly={activeMode === 'decode'}
              placeholder="{ 'sub': '1234567890', 'name': 'John Doe' }"
              className="flex-1"
            />
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}
