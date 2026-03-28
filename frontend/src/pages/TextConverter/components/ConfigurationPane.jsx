import React, { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function ConfigurationPane({ config, updateConfig }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/30 border rounded-md">
      <div className="flex-1 min-w-[250px] space-y-2">
        <Label htmlFor="config-key" className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          Secret Key
        </Label>
        <div className="relative">
          <Input
            id="config-key"
            type={showKey ? 'text' : 'password'}
            placeholder="Enter key (e.g. 32 chars for AES-256)"
            value={config.key}
            onChange={(e) => updateConfig({ key: e.target.value })}
            className="h-8 text-xs pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8"
            onClick={() => setShowKey(!showKey)}
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[250px] space-y-2">
        <Label htmlFor="config-iv" className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          IV (Initialization Vector)
        </Label>
        <Input
          id="config-iv"
          type="text"
          placeholder="Enter IV (e.g. 16 chars for AES-CBC)"
          value={config.iv}
          onChange={(e) => updateConfig({ iv: e.target.value })}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
