import React from 'react';
import {
    Modal,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
    Link
} from '@carbon/react';
import { HELP_CONTENT } from '../constants';

export default function HelpModal({ open, onClose }) {
    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            modalHeading="Documentation & Help"
            passiveModal
            size="lg"
        >
            <div style={{ padding: '1rem 0' }}>
                {/* Syntax Section */}
                <section style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{HELP_CONTENT.syntax.title}</h4>
                    <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                        {HELP_CONTENT.syntax.description}{' '}
                        <Link href={HELP_CONTENT.syntax.link} target="_blank" rel="noopener noreferrer">
                            View Go template docs
                        </Link>
                    </p>
                    
                    <div style={{ 
                        backgroundColor: 'var(--cds-layer)', 
                        padding: '1rem', 
                        borderRadius: '4px',
                        border: '1px solid var(--cds-border-subtle)'
                    }}>
                        {HELP_CONTENT.syntax.examples.map((ex, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                marginBottom: idx < HELP_CONTENT.syntax.examples.length - 1 ? '0.75rem' : 0,
                                alignItems: 'center'
                            }}>
                                <code style={{ 
                                    backgroundColor: 'var(--cds-layer-hover)', 
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '3px',
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: '0.875rem',
                                    minWidth: '280px'
                                }}>
                                    {ex.syntax}
                                </code>
                                <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                                    {ex.desc}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Functions Section */}
                <section>
                    <h4 style={{ marginBottom: '0.5rem' }}>Available Functions</h4>
                    <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                        Powered by{' '}
                        <Link href="https://github.com/brianvoe/gofakeit" target="_blank" rel="noopener noreferrer">
                            gofakeit library
                        </Link>
                    </p>

                    <StructuredListWrapper>
                        <StructuredListHead>
                            <StructuredListRow head>
                                <StructuredListCell head>Category</StructuredListCell>
                                <StructuredListCell head>Functions</StructuredListCell>
                            </StructuredListRow>
                        </StructuredListHead>
                        <StructuredListBody>
                            {HELP_CONTENT.functions.map((func, idx) => (
                                <StructuredListRow key={idx}>
                                    <StructuredListCell style={{ fontWeight: 600, width: '150px' }}>
                                        {func.category}
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        <code style={{ 
                                            backgroundColor: 'var(--cds-layer)', 
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: '3px',
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: '0.8125rem'
                                        }}>
                                            {func.items}
                                        </code>
                                    </StructuredListCell>
                                </StructuredListRow>
                            ))}
                        </StructuredListBody>
                    </StructuredListWrapper>
                </section>
            </div>
        </Modal>
    );
}
