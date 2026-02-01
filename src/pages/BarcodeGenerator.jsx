import React, { useState, useCallback, useRef } from 'react';
import { Button, Dropdown, InlineLoading } from '@carbon/react';
import { Renew, Download } from '@carbon/icons-react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolLayoutToggle } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';
import { Backend } from '../utils/backendBridge';

const BARCODE_STANDARDS = [
  { value: 'QR', label: 'QR Code (2D)' },
  { value: 'EAN-13', label: 'EAN-13 (Retail - 13 digits)' },
  { value: 'EAN-8', label: 'EAN-8 (Small Retail - 8 digits)' },
  { value: 'Code128', label: 'Code 128 (High Density)' },
  { value: 'Code39', label: 'Code 39 (Alphanumeric)' },
];

const QR_ERROR_LEVELS = [
  { value: 'L', label: 'Low (~7%)' },
  { value: 'M', label: 'Medium (~15%)' },
  { value: 'Q', label: 'Quartile (~25%)' },
  { value: 'H', label: 'High (~30%)' },
];

const BARCODE_SIZES = [
  { value: 128, label: 'Small (128px)' },
  { value: 256, label: 'Medium (256px)' },
  { value: 512, label: 'Large (512px)' },
  { value: 1024, label: 'Extra Large (1024px)' },
];

// Calculate EAN checksum
const calculateEANChecksum = (code) => {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i], 10);
    if (i % 2 === 0) {
      sum += digit * 1;
    } else {
      sum += digit * 3;
    }
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum;
};

// Validation helpers
const validateContent = (content, standard) => {
  if (!content) return { valid: true, message: '' };

  switch (standard) {
    case 'EAN-13':
      if (content.length !== 12 && content.length !== 13) {
        return { valid: false, message: 'EAN-13 requires 12 or 13 digits' };
      }
      if (!/^\d+$/.test(content)) {
        return { valid: false, message: 'EAN-13 can only contain digits' };
      }
      // Validate checksum for 13 digits
      if (content.length === 13) {
        const providedChecksum = parseInt(content[12], 10);
        const calculatedChecksum = calculateEANChecksum(content.slice(0, 12));
        if (providedChecksum !== calculatedChecksum) {
          return {
            valid: false,
            message: `Invalid checksum. Use: ${content.slice(0, 12)}${calculatedChecksum} or just ${content.slice(0, 12)}`
          };
        }
      }
      break;
    case 'EAN-8':
      if (content.length !== 7 && content.length !== 8) {
        return { valid: false, message: 'EAN-8 requires 7 or 8 digits' };
      }
      if (!/^\d+$/.test(content)) {
        return { valid: false, message: 'EAN-8 can only contain digits' };
      }
      // Validate checksum for 8 digits
      if (content.length === 8) {
        const providedChecksum = parseInt(content[7], 10);
        const calculatedChecksum = calculateEANChecksum(content.slice(0, 7));
        if (providedChecksum !== calculatedChecksum) {
          return {
            valid: false,
            message: `Invalid checksum. Use: ${content.slice(0, 7)}${calculatedChecksum} or just ${content.slice(0, 7)}`
          };
        }
      }
      break;
    case 'Code39':
      if (!/^[0-9A-Z\-. $/+%]*$/.test(content)) {
        return { valid: false, message: 'Code 39 only supports: 0-9, A-Z, and - . $ / + % space' };
      }
      break;
  }

  return { valid: true, message: '' };
};

const getPlaceholder = (standard) => {
  switch (standard) {
    case 'EAN-13':
      return 'Enter 12 or 13 digits (e.g., 5901234123457)';
    case 'EAN-8':
      return 'Enter 7 or 8 digits (e.g., 55123457)';
    case 'Code128':
      return 'Enter any text (high density)';
    case 'Code39':
      return 'Enter alphanumeric: 0-9, A-Z, - . $ / + % space';
    case 'QR':
    default:
      return 'Enter text, URL, or any data to encode...';
  }
};

export default function BarcodeGenerator() {
  const [content, setContent] = useState('');
  const [standard, setStandard] = useState('QR');
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState('M');
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const layout = useLayoutToggle({
    toolKey: 'barcode-generator-layout',
    defaultDirection: 'horizontal',
    showToggle: true,
    persist: true
  });

  // Track what was last generated to prevent duplicate generation
  const lastGeneratedParams = useRef({ content: '', standard: 'QR', size: 256, level: 'M' });

  const generateBarcode = useCallback(async () => {
    if (!content.trim()) {
      setError('Please enter content to encode');
      return;
    }

    // Validate content first
    const validation = validateContent(content.trim(), standard);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    // Prevent duplicate generation if nothing changed
    const currentParams = { content: content.trim(), standard, size, level };
    if (qrImage &&
      currentParams.content === lastGeneratedParams.current.content &&
      currentParams.standard === lastGeneratedParams.current.standard &&
      currentParams.size === lastGeneratedParams.current.size &&
      (standard !== 'QR' || currentParams.level === lastGeneratedParams.current.level)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await Backend.BarcodeService.GenerateBarcode({
        content: content.trim(),
        standard,
        size,
        level,
        format: 'base64',
      });

      if (response.error) {
        setError(response.error);
        setQrImage('');
      } else {
        setQrImage(response.dataUrl);
        setError('');
        lastGeneratedParams.current = currentParams;
      }
    } catch (err) {
      setError(`Failed to generate barcode: ${err.message}`);
      setQrImage('');
    } finally {
      setLoading(false);
    }
  }, [content, standard, size, level, qrImage]);

  const downloadBarcode = useCallback(() => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `barcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrImage]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Clear error if content becomes valid
    if (error) {
      const validation = validateContent(newContent, standard);
      if (validation.valid) {
        setError('');
      }
    }
  };

  const handleStandardChange = ({ selectedItem }) => {
    const newStandard = selectedItem?.value || 'QR';
    setStandard(newStandard);
    setQrImage(''); // Clear image when changing standard
    lastGeneratedParams.current = { content: '', standard: newStandard, size, level };

    // Re-validate content for new standard
    if (content) {
      const validation = validateContent(content, newStandard);
      if (!validation.valid) {
        setError(validation.message);
      } else {
        setError('');
      }
    }
  };

  const isQR = standard === 'QR';

  return (
    <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      <ToolHeader
        title="Barcode / QR Code Generator"
        description="Generate various barcode types including QR codes, EAN, and Code 128/39."
      />

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        padding: '0.75rem',
        backgroundColor: 'var(--cds-layer)',
        borderRadius: '4px',
      }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <Dropdown
            id="barcode-standard"
            titleText="Barcode Standard"
            label="Select standard"
            items={BARCODE_STANDARDS}
            itemToString={(item) => item?.label || ''}
            selectedItem={BARCODE_STANDARDS.find(s => s.value === standard)}
            onChange={handleStandardChange}
            size="sm"
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <Dropdown
            id="barcode-size"
            titleText="Size"
            label="Select size"
            items={BARCODE_SIZES}
            itemToString={(item) => item?.label || ''}
            selectedItem={BARCODE_SIZES.find(s => s.value === size)}
            onChange={({ selectedItem }) => {
              setSize(selectedItem?.value || 256);
              setQrImage('');
            }}
            size="sm"
          />
        </div>

        {isQR && (
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Dropdown
              id="qr-level"
              titleText="Error Correction"
              label="Select level"
              items={QR_ERROR_LEVELS}
              itemToString={(item) => item?.label || ''}
              selectedItem={QR_ERROR_LEVELS.find(l => l.value === level)}
              onChange={({ selectedItem }) => {
                setLevel(selectedItem?.value || 'M');
                setQrImage('');
              }}
              size="sm"
            />
          </div>
        )}

        <Button
          renderIcon={Renew}
          onClick={generateBarcode}
          disabled={loading || !content.trim()}
          size="sm"
        >
          Generate
        </Button>

        <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
          <ToolLayoutToggle
            direction={layout.direction}
            onToggle={layout.toggleDirection}
            position="controls"
          />
        </div>
      </div>

      <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
        {/* Input Pane */}
        <ToolPane
          label="Content"
          value={content}
          onChange={handleContentChange}
          placeholder={getPlaceholder(standard)}
          invalid={!!error}
          invalidText={error}
        />

        {/* Output Pane */}
        <div className="pane" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '50vh',
          flex: 1,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '30px',
            overflowX: 'hidden',
          }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: '0.32px',
              color: 'var(--cds-text-secondary)',
              textTransform: 'uppercase',
            }}>
              {isQR ? 'QR Code' : `${standard} Barcode`}
            </label>
            {qrImage && (
              <Button
                renderIcon={Download}
                onClick={downloadBarcode}
                kind="ghost"
                size="sm"
                iconDescription="Download barcode"
                hasIconOnly
              />
            )}
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--cds-layer)',
            padding: '1rem',
            overflow: 'auto',
          }}>
            {loading ? (
              <InlineLoading description="Generating barcode..." />
            ) : qrImage ? (
              <img
                src={qrImage}
                alt={`Generated ${standard}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{
                color: 'var(--cds-text-secondary)',
                textAlign: 'center',
              }}>
                <p>{isQR ? 'QR code' : `${standard} barcode`} will appear here</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Enter content and click Generate
                </p>
              </div>
            )}
          </div>
        </div>
      </ToolSplitPane>
    </div>
  );
}
