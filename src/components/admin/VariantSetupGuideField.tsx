'use client'

import React from 'react'

const steps = [
  {
    title: 'Set up the catalog (once)',
    body: 'Catalog → Variant Groups (e.g. Color, Size). Add values under each group via Linked Values, or Catalog → Variant Values. Publish groups and values.',
  },
  {
    title: 'Configure this product',
    body: 'Enable variants, then add one row per dimension. Pick a Variant Group, then select or add Available Values (use Create New in the picker).',
  },
  {
    title: 'Optional images',
    body: 'For visual groups (e.g. Color), add Value Galleries so the storefront image changes when a customer picks a value.',
  },
  {
    title: 'Generate & publish',
    body: 'Save the product, click Generate missing combinations, review Linked Variants, then publish the product.',
  },
] as const

export default function VariantSetupGuideField() {
  return (
    <div className="field-type">
      <div
        className="field-type__wrap"
        style={{
          padding: 'var(--base)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s)',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <p className="field-label" style={{ marginBottom: '0.5rem' }}>
          How product variants work
        </p>
        <p className="field-description" style={{ marginBottom: '1rem' }}>
          Catalog options (shared) → product configuration (which values this product offers) →
          generated combinations (what customers can buy). Example: 3 colors × 4 sizes = 12
          variants.
        </p>

        <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.75rem' }}>
          {steps.map((step, index) => (
            <li key={step.title} className="field-description" style={{ margin: 0 }}>
              <strong>
                {index + 1}. {step.title}
              </strong>
              <div style={{ marginTop: '0.25rem' }}>{step.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
