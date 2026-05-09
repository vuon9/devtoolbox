import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Settings, Check } from 'lucide-react';
import { GetCloseMinimizesToTray, SetCloseMinimizesToTray } from '../generated';
import { useTheme } from '../context/ThemeContext';
import { BUILT_IN_THEME_KEYS } from '../theme';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

export function SettingsModal({ isOpen, onClose }) {
  const { themeMode, setThemeMode, themeName, setThemeName, allThemes } = useTheme();
  const [closeMinimizesToTray, setCloseMinimizesToTray] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const value = await GetCloseMinimizesToTray();
      setCloseMinimizesToTray(value);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const galleryThemes = allThemes.filter((t) => !t.isBuiltIn);
  const isBuiltInActive = BUILT_IN_THEME_KEYS.includes(themeName);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card text-card-foreground border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold mb-6">
            <Settings className="w-5 h-5" />
            Application Settings
          </Dialog.Title>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Appearance</label>
            <RadioGroup.Root value={themeMode} onValueChange={setThemeMode} className="flex gap-4">
              {['system', 'dark', 'light'].map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroup.Item
                    value={mode}
                    className="w-4 h-4 rounded-full border border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary flex items-center justify-center"
                  >
                    <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </RadioGroup.Item>
                  <span className="text-sm text-muted-foreground capitalize">{mode}</span>
                </label>
              ))}
            </RadioGroup.Root>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Theme</label>
            <Select value={themeName} onValueChange={setThemeName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a theme..." />
              </SelectTrigger>
              <SelectContent>
                {allThemes.map((t) => {
                  const key = t.name.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <SelectItem key={key} value={key}>
                      {t.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Behavior</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox.Root
                checked={closeMinimizesToTray}
                onCheckedChange={async (checked) => {
                  if (isLoading) return;
                  setIsLoading(true);
                  try {
                    await SetCloseMinimizesToTray(checked);
                    setCloseMinimizesToTray(checked);
                  } catch (err) {
                    console.error('Failed to save setting:', err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-4 h-4 rounded border border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center"
              >
                <Checkbox.Indicator>
                  <Check className="w-3 h-3 text-primary-foreground" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-sm text-muted-foreground">Close button minimizes to tray</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              When enabled, clicking the close button will minimize the app to the system tray
              instead of quitting.
            </p>
          </div>

          <Dialog.Close asChild>
            <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SettingsModal;
