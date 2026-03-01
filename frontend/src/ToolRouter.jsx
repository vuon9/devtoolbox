import React from 'react';
import { useParams } from 'react-router-dom';

// Tool Imports
import DateTimeConverter from './pages/DateTimeConverter';
import JwtDebugger from './pages/JwtDebugger';
import RegExpTester from './pages/RegExpTester';
import CronJobParser from './pages/CronJobParser';
import TextDiffChecker from './pages/TextDiffChecker';
import NumberConverter from './pages/NumberConverter';
import TextConverter from './pages/TextConverter';
import StringUtilities from './pages/StringUtilities';
import BarcodeGenerator from './pages/BarcodeGenerator';
import DataGenerator from './pages/DataGenerator';
import CodeFormatter from './pages/CodeFormatter';
import ColorConverter from './pages/ColorConverter';

const toolComponents = {
  'text-converter': TextConverter,
  'string-utilities': StringUtilities,
  'datetime-converter': DateTimeConverter,
  'jwt': JwtDebugger,
  'barcode': BarcodeGenerator,
  'data-generator': DataGenerator,
  'code-formatter': CodeFormatter,
  'color-converter': ColorConverter,
  'regexp': RegExpTester,
  'cron': CronJobParser,
  'diff': TextDiffChecker,
  'number-converter': NumberConverter,
};

function ToolRouter() {
  const { toolId } = useParams();
  const ToolComponent = toolComponents[toolId];
  
  if (!ToolComponent) {
    return (
      <div className="tool-container" style={{ padding: '2rem' }}>
        <h2>Tool Not Found</h2>
        <p>The tool "{toolId}" doesn't exist.</p>
      </div>
    );
  }
  
  return <ToolComponent />;
}

export default ToolRouter;