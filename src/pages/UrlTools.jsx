import React from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import UrlParser from './UrlParser';
import UrlEncoder from './UrlEncoder';
import { ToolHeader } from '../components/ToolUI';

export default function UrlTools() {
    return (
        <div className="tool-container">
            <ToolHeader title="URL Tools" description="Parse, Encode, and Decode URLs." />

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
