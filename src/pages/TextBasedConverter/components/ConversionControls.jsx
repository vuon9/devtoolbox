import { Button, Dropdown, Toggle, RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolLayoutToggle } from '../../../components/ToolUI';
import { ArrowsHorizontal, Play } from '@carbon/icons-react';
import { CONVERTER_MAP } from '../constants';

export default function ConversionControls({
    category,
    setCategory,
    method,
    setMethod,
    subMode,
    setSubMode,
    layout,
    autoRun,
    setAutoRun,
    onConvert,
    isAllHashes = false,
}) {
    const categories = Object.keys(CONVERTER_MAP);
    const methods = CONVERTER_MAP[category] || [];

    const showModeToggle = ['Encrypt - Decrypt', 'Encode - Decode'].includes(category);
    const modeLabels = category === 'Encrypt - Decrypt'
        ? { left: 'Encrypt', right: 'Decrypt' }
        : { left: 'Encode', right: 'Decode' };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '0.5rem',
        }}>
            {/* Main Controls Row */}
            <div style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
            }}>
                {/* Primary Controls */}
                <div style={{ width: '180px' }}>
                    <Dropdown
                        id="category-select"
                        titleText="Category"
                        label="Select category"
                        items={categories}
                        selectedItem={category}
                        onChange={({ selectedItem }) => setCategory(selectedItem)}
                    />
                </div>

                <div style={{ width: '280px' }}>
                    <Dropdown
                        id="method-select"
                        titleText="Algorithm / Method"
                        label="Select method"
                        items={methods}
                        selectedItem={method}
                        onChange={({ selectedItem }) => setMethod(selectedItem)}
                    />
                </div>

                {/* Convert Button - Always visible, disabled when auto-run is on */}
                <div style={{ paddingBottom: '4px' }}>
                    <Button
                        kind="primary"
                        size="md"
                        renderIcon={Play}
                        onClick={onConvert}
                        disabled={autoRun}
                    >
                        Convert
                    </Button>
                </div>

                {/* Auto-run Toggle */}
                <div style={{ paddingBottom: '12px', minWidth: '120px' }}>
                    <Toggle
                        id="auto-run-toggle"
                        labelA="Manual"
                        labelB="Auto-run"
                        toggled={autoRun}
                        onToggle={setAutoRun}
                        size="sm"
                    />
                </div>

                {/* Layout Toggle */}
                {layout.showToggle && (
                    <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
                        <ToolLayoutToggle
                            direction={layout.direction}
                            onToggle={layout.toggleDirection}
                            position="controls"
                        />
                    </div>
                )}
            </div>

            {/* Mode Toggle Row - Only shown for Encrypt/Decrypt and Encode/Decode */}
            {showModeToggle && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '12px',
                }}>
                    <RadioButtonGroup
                        legendText="Mode"
                        name="tbc-submode-group"
                        valueSelected={subMode}
                        onChange={(val) => setSubMode(val)}
                        orientation="horizontal"
                    >
                        <RadioButton
                            labelText={modeLabels.left}
                            value={modeLabels.left}
                            id={`mode-${modeLabels.left}`}
                            size="sm"
                        />
                        <RadioButton
                            labelText={modeLabels.right}
                            value={modeLabels.right}
                            id={`mode-${modeLabels.right}`}
                            size="sm"
                        />
                    </RadioButtonGroup>
                </div>
            )}
        </div>
    );
}
