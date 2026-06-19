'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { getRelationshipId } from '@/lib/relationships'
import { previewCombinationCount } from '@/lib/variantCombinations'

type VariantGroupSettingFormRow = {
  group?: unknown
  values?: unknown
}

function resolveSettingsFromForm(value: unknown): VariantGroupSettingFormRow[] {
  if (!Array.isArray(value)) return []
  return value as VariantGroupSettingFormRow[]
}

export default function GenerateVariantsField() {
  const { id } = useDocumentInfo()
  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))
  const variantGroupSettings = useFormFields(([fields]) => fields.variantGroupSettings?.value)
  const [isGenerating, setIsGenerating] = useState(false)

  const settings = useMemo(
    () => resolveSettingsFromForm(variantGroupSettings),
    [variantGroupSettings],
  )

  const configuredGroupCount = useMemo(
    () => settings.filter((row) => getRelationshipId(row.group) !== null).length,
    [settings],
  )

  const rowsWithValues = useMemo(
    () =>
      settings.filter((row) => {
        if (getRelationshipId(row.group) === null) return false
        const values = Array.isArray(row.values) ? row.values : []
        return values.some((value) => getRelationshipId(value) !== null)
      }).length,
    [settings],
  )

  const combinationCount = useMemo(() => previewCombinationCount(settings), [settings])

  const canGenerate = Boolean(
    id && enableVariants && configuredGroupCount > 0 && combinationCount > 0,
  )

  const handleGenerate = useCallback(async () => {
    if (!id) {
      toast.error('Save the product first, then generate variants.')
      return
    }

    if (!canGenerate) {
      toast.error('Configure variant groups and available values before generating.')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(`/api/products/${id}/generate-variants`, {
        method: 'POST',
        credentials: 'include',
      })

      const result = (await response.json()) as {
        created?: number
        skipped?: number
        totalCombinations?: number
        errors?: Array<{ message?: string }>
      }

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message ?? 'Failed to generate variants.')
      }

      toast.success(
        `Created ${result.created ?? 0} variant(s). Skipped ${result.skipped ?? 0} existing combination(s) out of ${result.totalCombinations ?? 0}.`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate variants.')
    } finally {
      setIsGenerating(false)
    }
  }, [id, canGenerate])

  return (
    <div className="field-type">
      <div className="field-type__wrap">
        <label className="field-label">Generate variant combinations</label>
        <p className="field-description">
          Creates one Product Variant per combination of your configured values. Existing
          combinations are preserved — only missing rows are added.
        </p>

        {!id ? (
          <p className="field-description">Save the product first to enable generation.</p>
        ) : !enableVariants ? (
          <p className="field-description">Enable variants on this product to use generation.</p>
        ) : configuredGroupCount === 0 ? (
          <p className="field-description">
            Scroll up to <strong>Variant Groups (this product)</strong>, add a row for each
            dimension (e.g. Color, Size), and save the product.
          </p>
        ) : rowsWithValues < configuredGroupCount ? (
          <p className="field-description">
            {configuredGroupCount - rowsWithValues} variant group row
            {configuredGroupCount - rowsWithValues === 1 ? '' : 's'} still need available values.
            Each row must list values that belong to its selected group.
          </p>
        ) : combinationCount === 0 ? (
          <p className="field-description">
            Each variant group needs at least one available value before generation.
          </p>
        ) : (
          <p className="field-description">
            Preview: {combinationCount} combination{combinationCount === 1 ? '' : 's'} from{' '}
            {configuredGroupCount} group{configuredGroupCount === 1 ? '' : 's'}.
          </p>
        )}

        <Button
          buttonStyle="secondary"
          disabled={!canGenerate || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? 'Generating…' : 'Generate missing combinations'}
        </Button>
      </div>
    </div>
  )
}
