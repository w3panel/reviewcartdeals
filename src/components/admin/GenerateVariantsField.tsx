'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button, toast, useDocumentInfo, useForm, useFormFields } from '@payloadcms/ui'

import {
  fetchPublishedOptionValueLabelsForTypes,
  fetchVariantOptionValueLabels,
  fetchVariantTypeLabels,
} from '@/lib/fetchPublishedOptionValues'
import {
  collectOptionValueIds,
  computeVariantMatrixPreview,
  formatMissingTypeLabels,
  getEffectiveAvailabilityForPreview,
  getVariantOptionTypeIdsFromForm,
  resolveVariantTypesForPreview,
} from '@/lib/productOptionAvailability'
import type { AvailabilityRow } from '@/lib/productOptionAvailability'

function resolveAvailabilityFromForm(value: unknown): AvailabilityRow[] {
  if (!Array.isArray(value)) return []
  return value as AvailabilityRow[]
}

export default function GenerateVariantsField() {
  const { id } = useDocumentInfo()
  const { submit } = useForm()
  const [loading, setLoading] = useState(false)
  const [typeLabelById, setTypeLabelById] = useState<Record<number, string>>({})
  const [optionValueLabelById, setOptionValueLabelById] = useState<Record<number, string>>({})

  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))

  const variantOptionTypes = useFormFields(([fields]) => fields.variantOptionTypes?.value)

  const variantOptionAvailability = useFormFields(([fields]) =>
    resolveAvailabilityFromForm(fields.variantOptionAvailability?.value),
  )

  const typeIdsKey = useMemo(
    () => getVariantOptionTypeIdsFromForm(variantOptionTypes).join(','),
    [variantOptionTypes],
  )

  const typeIds = useMemo(
    () => (typeIdsKey.length === 0 ? [] : typeIdsKey.split(',').map(Number)),
    [typeIdsKey],
  )

  useEffect(() => {
    const ids = typeIdsKey.length === 0 ? [] : typeIdsKey.split(',').map(Number)
    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetchVariantTypeLabels(ids).then((labels) => {
        if (!cancelled) setTypeLabelById(labels)
      })
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [typeIdsKey])

  const resolvedTypes = useMemo(
    () =>
      resolveVariantTypesForPreview(variantOptionTypes, variantOptionAvailability, typeLabelById),
    [variantOptionTypes, variantOptionAvailability, typeLabelById],
  )

  const effectiveAvailability = useMemo(
    () => getEffectiveAvailabilityForPreview(variantOptionTypes, variantOptionAvailability),
    [variantOptionTypes, variantOptionAvailability],
  )

  const optionValueIdsKey = useMemo(
    () => collectOptionValueIds(effectiveAvailability).join(','),
    [effectiveAvailability],
  )

  useEffect(() => {
    const ids = typeIdsKey.length === 0 ? [] : typeIdsKey.split(',').map(Number)
    const valueIds = optionValueIdsKey.length === 0 ? [] : optionValueIdsKey.split(',').map(Number)

    let cancelled = false
    const timer = window.setTimeout(() => {
      async function loadOptionValueLabels() {
        const labelsFromTypes =
          ids.length > 0 ? await fetchPublishedOptionValueLabelsForTypes(ids) : {}
        const labelsFromIds =
          valueIds.length > 0 ? await fetchVariantOptionValueLabels(valueIds) : {}

        if (!cancelled) {
          setOptionValueLabelById({ ...labelsFromTypes, ...labelsFromIds })
        }
      }

      void loadOptionValueLabels()
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [typeIdsKey, optionValueIdsKey])

  const matrixPreview = useMemo(
    () => computeVariantMatrixPreview(resolvedTypes, effectiveAvailability, optionValueLabelById),
    [resolvedTypes, effectiveAvailability, optionValueLabelById],
  )

  const missingTypeLabels = useMemo(
    () => formatMissingTypeLabels(matrixPreview.missingTypeLabels, typeLabelById),
    [matrixPreview.missingTypeLabels, typeLabelById],
  )

  const canAttemptGenerate = Boolean(id && enableVariants && typeIds.length > 0)

  const handleGenerate = async () => {
    if (!id) {
      toast.error('Save the product first, then generate variants.')
      return
    }

    if (!matrixPreview.isReady) {
      toast.error(
        missingTypeLabels.length > 0
          ? `Select available values for: ${missingTypeLabels.join(', ')}. Add published values under Catalog → Variant Option Values if the list is empty.`
          : 'Configure variant option types and available values before generating.',
      )
      return
    }

    setLoading(true)
    try {
      await submit({
        skipValidation: true,
        disableFormWhileProcessing: false,
      })

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
            Save the product (or wait for autosave) after changing variant types so availability and
            gallery rows can synchronize before generating variants. Uses the available values
            selected above — remove any you do not want before generating.
          </p>
        </div>

        <div className="rounded border border-(--theme-elevation-100) bg-(--theme-elevation-50) p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--theme-elevation-700)">
            Combination preview
          </p>

          {!canAttemptGenerate ? (
            <p className="text-sm text-(--theme-elevation-700)">
              Save the product, enable variants, and assign variant option types first.
            </p>
          ) : !matrixPreview.isReady ? (
            <p className="text-sm text-(--theme-elevation-700)">
              {missingTypeLabels.length > 0
                ? `Save the product (or wait for autosave), then select available values for: ${missingTypeLabels.join(', ')}. Published option values must exist in Catalog → Variant Option Values.`
                : 'Save the product (or wait for autosave) after changing variant types so availability rows can sync, then preview combinations here.'}
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
          disabled={loading || !canAttemptGenerate}
          onClick={handleGenerate}
        >
          {loading ? 'Generating…' : 'Generate Variant Combinations'}
        </Button>
      </div>
    </div>
  )
}
