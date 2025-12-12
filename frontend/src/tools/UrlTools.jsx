import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import UrlParser from './UrlParser';
import UrlEncoder from './UrlEncoder';

export default function UrlTools() {
    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">URL Tools</h2>
                <p className="tool-desc">Parse, Encode, and Decode URLs.</p>
            </div>

            <Tabs>
                <TabList aria-label="URL Tools Tabs">
                    <Tab>URL Parser</Tab>
                    <Tab>URL Encode/Decode</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div style={{ paddingTop: '1rem' }}>
                            <UrlParser />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ paddingTop: '1rem' }}>
                            <UrlEncoder />
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
}
