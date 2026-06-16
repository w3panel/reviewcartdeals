'use client'

import React, { useMemo, useState } from 'react'
import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'

import { computeVariantMatrixPreview, type AvailabilityRow } from '@/lib/productOptionAvailability'
import type { VariantType } from '@/payload-types'

function resolveVariantTypesFromForm(value: unknown): VariantType[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry) => {
    if (typeof entry === 'object' && entry !== null && 'label' in entry && 'id' in entry) {
      return [entry as VariantType]
    }
    return []
  })
}

function resolveAvailabilityFromForm(value: unknown): AvailabilityRow[] {
  if (!Array.isArray(value)) return []
  return value as AvailabilityRow[]
}

export default function GenerateVariantsField() {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)

  const variantOptionTypes = useFormFields(([fields]) =>
    resolveVariantTypesFromForm(fields.variantOptionTypes?.value),
  )

  const variantOptionAvailability = useFormFields(([fields]) =>
    resolveAvailabilityFromForm(fields.variantOptionAvailability?.value),
  )

  const matrixPreview = useMemo(
    () => computeVariantMatrixPreview(variantOptionTypes, variantOptionAvailability),
    [variantOptionTypes, variantOptionAvailability],
  )

  const handleGenerate = async () => {
    if (!id) {
      toast.error('Save the product first, then generate variants.')
      return
    }

    if (!matrixPreview.isReady) {
      toast.error(
        matrixPreview.missingTypeLabels.length > 0
          ? `Select available values for: ${matrixPreview.missingTypeLabels.join(', ')}.`
          : 'Configure variant option types and available values before generating.',
      )
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${id}/generate-variants`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = (await response.json()) as {
        created?: number
        skipped?: number
        totalCombinations?: number
        errors?: Array<{ message?: string }>
        message?: string
      }

      if (!response.ok) {
        const message =
          result.errors?.[0]?.message ??
          result.message ??
          'Failed to generate variants for this product.'
        throw new Error(message)
      }

      toast.success(
        `Generated ${result.created ?? 0} draft variant(s). Skipped ${result.skipped ?? 0} existing combination(s) out of ${result.totalCombinations ?? 0}.`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate variants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="field-type">
      <div className="flex flex-col gap-4 rounded border border-(--theme-elevation-150) p-4">
        <div>
          <p className="text-sm font-semibold text-(--theme-elevation-900)">
            Generate variant combinations
          </p>
          <p className="mt-1 text-sm text-(--theme-elevation-800)">
            Primary workflow: creates draft variants from the available values selected above only.
            Existing combinations are skipped. Product attributes are not included.
          </p>
        </div>

        <div className="rounded border border-(--theme-elevation-100) bg-(--theme-elevation-50) p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--theme-elevation-700)">
            Combination preview
          </p>

          {!matrixPreview.isReady ? (
            <p className="text-sm text-(--theme-elevation-700)">
              {matrixPreview.missingTypeLabels.length > 0
                ? `Select available values for: ${matrixPreview.missingTypeLabels.join(', ')}.`
                : 'Assign variant option types and available values to preview combinations.'}
            </p>
          ) : (
            <>
              <p className="text-sm text-(--theme-elevation-800)">
                {matrixPreview.dimensions
                  .map((dimension) => `${dimension.values.length} ${dimension.label}`)
                  .join(' × ')}{' '}
                = <strong>{matrixPreview.totalCombinations}</strong> combination
                {matrixPreview.totalCombinations === 1 ? '' : 's'}
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-(--theme-elevation-700)">
                {matrixPreview.combinations.map((combination) => (
                  <li key={combination}>{combination}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Button
          buttonStyle="primary"
          disabled={loading || !id || !matrixPreview.isReady}
          onClick={handleGenerate}
        >
          {loading ? 'Generating…' : 'Generate Variant Combinations'}
        </Button>
      </div>
    </div>
  )
}
