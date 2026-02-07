/**
 * Backend Bridge
 *
 * seamless communication bridge that detects if the app is running
 * in Wails (native) or Web Mode (browser) and routes requests accordingly.
 */

import React from "react";
import {
    ConversionService,
    JWTService,
    BarcodeService,
    DataGeneratorService,
    CodeFormatterService,
} from "../../bindings/devtoolbox/internal/wails";

// Detect Wails environment by checking for window.runtime
const isWails = () => typeof window.runtime !== 'undefined';

// Base URL for the local HTTP server in Web Mode
const API_BASE_URL = 'http://localhost:8081';

/**
 * Generic helper to call backend methods
 */
async function callBackend(service, method, ...args) {
    if (isWails()) {
        // Direct Wails binding call
        // Wails generates bindings under window.go.wails(not window.go.main)
        try {
            return await window.go.wails[service][method](...args);
        } catch (err) {
            console.error(`Wails call failed: ${service}.${method}`, err);
            throw err;
        }
    } else {
        // Remote HTTP call for Web Mode
        try {
            const response = await fetch(`${API_BASE_URL}/api/${service}/${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ args }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (err) {
            console.error(`Web API call failed: ${service}/${method}`, err);
            throw err;
        }
    }
}

// Exposed Backend Services
export const Backend = {
    JWTService: {
        Decode: (token) => JWTService.Decode(token),
        Encode: (header, payload, algo, secret) => JWTService.Encode(header, payload, algo, secret),
        Verify: (token, secret, encoding) => JWTService.Verify(token, secret, encoding),
    },
    ConversionService: {
        Convert: (input, category, method, config) => ConversionService.Convert(input, category, method, config)
    },
    BarcodeService: {
        GenerateBarcode: (req) => BarcodeService.GenerateBarcode(req),
        GetQRErrorLevels: () => BarcodeService.GetQRErrorLevels(),
        GetBarcodeSizes: () => BarcodeService.GetBarcodeSizes(),
        GetBarcodeStandards: () => BarcodeService.GetBarcodeStandards(),
        ValidateContent: (content, standard) => BarcodeService.ValidateContent(content, standard)
    },
    DataGeneratorService: {
        Generate: (req) => DataGeneratorService.Generate(req),
        GetPresets: () => DataGeneratorService.GetPresets(),
        ValidateTemplate: (template) => DataGeneratorService.ValidateTemplate(template)
    },
    CodeFormatterService: {
        Format: (req) => CodeFormatterService.Format(req)
    }
};
