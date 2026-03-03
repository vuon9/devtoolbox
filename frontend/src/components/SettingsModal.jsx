import React, { useState, useEffect } from 'react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  Checkbox,
  FormGroup,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { Settings } from '@carbon/icons-react';
import { GetCloseMinimizesToTray, SetCloseMinimizesToTray } from '../generated';
import './SettingsModal.css';

export function SettingsModal({ isOpen, onClose, themeMode, setThemeMode }) {
  const [closeMinimizesToTray, setCloseMinimizesToTray] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const value = await GetCloseMinimizesToTray();
      console.log('Loaded setting:', value);
      setCloseMinimizesToTray(value);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  return (
    <ComposedModal open={isOpen} onClose={onClose} size="sm" className="settings-modal">
      <ModalHeader icon={<Settings size={20} />} label="" title="Application Settings" />
      <ModalBody className="settings-modal-body">
        <FormGroup legendText="Appearance">
          <RadioButtonGroup
            name="theme-mode"
            defaultSelected={themeMode}
            onChange={(value) => setThemeMode(value)}
          >
            <RadioButton labelText="System" value="system" id="theme-system" />
            <RadioButton labelText="Dark" value="dark" id="theme-dark" />
            <RadioButton labelText="Light" value="light" id="theme-light" />
          </RadioButtonGroup>
        </FormGroup>

        <FormGroup legendText="Behavior" style={{ marginTop: '1.5rem' }}>
          <Checkbox
            labelText="Close button minimizes to tray"
            checked={closeMinimizesToTray}
            onChange={(event) => {
              // Carbon Checkbox passes the event, we need to get checked from event.target
              const checked = event.target.checked;
              if (isLoading) {
                console.log('Still loading, please wait');
                return;
              }

              console.log('Setting close minimizes to:', checked);
              setIsLoading(true);
              SetCloseMinimizesToTray(checked)
                .then(() => {
                  setCloseMinimizesToTray(checked);
                  console.log('Setting saved successfully');
                })
                .catch((err) => {
                  console.error('Failed to save setting:', err);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            disabled={isLoading}
            id="close-minimizes"
          />
          <p className="settings-description">
            When enabled, clicking the close button will minimize the app to the system tray instead
            of quitting.
          </p>
        </FormGroup>
      </ModalBody>
    </ComposedModal>
  );
}

export default SettingsModal;
