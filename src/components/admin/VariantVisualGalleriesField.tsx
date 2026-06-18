'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, useForm, useFormFields } from '@payloadcms/ui'

import { fetchVariantTypesByIds } from '@/lib/fetchPublishedOptionValues'
import {
  getVariantOptionTypeIdsFromForm,
  type AvailabilityRow,
} from '@/lib/productOptionAvailability'
import { getRelationshipId } from '@/lib/variantOptionValues'
import {
  getRequiredVisualOptionValueIds,
  resolveVisualGalleryTypeIds,
  type VisualGalleryFormRow,
} from '@/lib/syncVariantVisualGalleries'

import './VariantVisualGalleriesField.scss'

function resolveAvailabilityFromForm(value: unknown): AvailabilityRow[] {
  if (!Array.isArray(value)) return []
  return value as AvailabilityRow[]
}

function buildGallerySyncKey(
  typeIdsKey: string,
  availabilityKey: string,
  optionValueIds: number[],
): string {
  return `${typeIdsKey}|${availabilityKey}|${[...optionValueIds].sort((a, b) => a - b).join(',')}`
}

const VariantVisualGalleriesField: ArrayFieldClientComponent = (props) => {
  const { addFieldRow, dispatchFields, removeFieldRow } = useForm()
  const syncingRef = useRef(false)
  const lastSyncedKeyRef = useRef('')
  const rowsRef = useRef<VisualGalleryFormRow[]>([])
  const [visualTypeLabel, setVisualTypeLabel] = useState<string | null>(null)

  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))
  const variantOptionTypes = useFormFields(([fields]) => fields.variantOptionTypes?.value)
  const availabilityRows = useFormFields(([fields]) =>
    resolveAvailabilityFromForm(fields.variantOptionAvailability?.value),
  )
  const variantVisualGalleries = useFormFields(([fields]) => {
    const value = fields.variantVisualGalleries?.value
    return Array.isArray(value) ? (value as VisualGalleryFormRow[]) : []
  })

  rowsRef.current = variantVisualGalleries

  const availabilityRowsRef = useRef(availabilityRows)
  availabilityRowsRef.current = availabilityRows

  const typeIds = useMemo(
    () => getVariantOptionTypeIdsFromForm(variantOptionTypes),
    [variantOptionTypes],
  )

  const typeIdsKey = useMemo(() => typeIds.join(','), [typeIds])

  const availabilityKey = useMemo(
    () =>
      availabilityRows
        .map((row) => {
          const typeId = getRelationshipId(row.type)
          const valueIds = (row.optionValues ?? [])
            .map((entry) => getRelationshipId(entry))
            .filter((id): id is number => id !== null)
            .sort((left, right) => left - right)
            .join(',')
          return `${typeId ?? 'none'}:${valueIds}`
        })
        .join('|'),
    [availabilityRows],
  )

  const galleryRowKey = useMemo(
    () =>
      variantVisualGalleries
        .map((row) => getRelationshipId(row.optionValue))
        .filter((id): id is number => id !== null)
        .sort((left, right) => left - right)
        .join(','),
    [variantVisualGalleries],
  )

  useEffect(() => {
    let cancelled = false

    async function syncRows() {
      if (!enableVariants || syncingRef.current) return

      const syncKey = `${typeIdsKey}|${availabilityKey}|${galleryRowKey}`
      if (syncKey === lastSyncedKeyRef.current) return

      const path = props.path
      const schemaPath = props.schemaPath ?? path
      const currentRows = rowsRef.current
      const availabilityRows = availabilityRowsRef.current

      if (typeIds.length === 0) {
        if (currentRows.length === 0) {
          lastSyncedKeyRef.current = syncKey
          return
        }
        for (let index = currentRows.length - 1; index >= 0; index--) {
          removeFieldRow({ path, rowIndex: index })
        }
        lastSyncedKeyRef.current = `${typeIdsKey}|${availabilityKey}|`
        setVisualTypeLabel(null)
        return
      }

      const types = await fetchVariantTypesByIds(typeIds)
      if (cancelled) return

      const visualTypeIds = resolveVisualGalleryTypeIds(typeIds, types)
      const primaryType = types.find((type) => visualTypeIds.includes(type.id))
      setVisualTypeLabel(primaryType?.label ?? null)

      const requiredOptionValueIds = getRequiredVisualOptionValueIds(
        availabilityRows,
        visualTypeIds,
      )
      const requiredSet = new Set(requiredOptionValueIds)

      const existingOptionValueIds = new Set<number>()
      currentRows.forEach((row) => {
        const optionValueId = getRelationshipId(row.optionValue)
        if (optionValueId !== null) existingOptionValueIds.add(optionValueId)
      })

      const hasAllRequired = requiredOptionValueIds.every((id) => existingOptionValueIds.has(id))
      const hasOnlyRequired = currentRows.every((row) => {
        const optionValueId = getRelationshipId(row.optionValue)
        return optionValueId !== null && requiredSet.has(optionValueId)
      })

      if (
        hasAllRequired &&
        hasOnlyRequired &&
        currentRows.length === requiredOptionValueIds.length
      ) {
        lastSyncedKeyRef.current = buildGallerySyncKey(
          typeIdsKey,
          availabilityKey,
          requiredOptionValueIds,
        )
        return
      }

      for (let index = currentRows.length - 1; index >= 0; index--) {
        const optionValueId = getRelationshipId(currentRows[index]?.optionValue)
        if (optionValueId === null || !requiredSet.has(optionValueId)) {
          removeFieldRow({ path, rowIndex: index })
        }
      }

      let nextRowIndex = currentRows.filter((row) => {
        const optionValueId = getRelationshipId(row.optionValue)
        return optionValueId !== null && requiredSet.has(optionValueId)
      }).length

      for (const optionValueId of requiredOptionValueIds) {
        if (existingOptionValueIds.has(optionValueId)) continue

        syncingRef.current = true
        addFieldRow({
          path,
          rowIndex: nextRowIndex,
          schemaPath,
        })
        dispatchFields({
          type: 'UPDATE',
          path: `${path}.${nextRowIndex}.optionValue`,
          value: optionValueId,
        })
        nextRowIndex++
        syncingRef.current = false
      }

      lastSyncedKeyRef.current = buildGallerySyncKey(
        typeIdsKey,
        availabilityKey,
        requiredOptionValueIds,
      )
    }

    void syncRows()

    return () => {
      cancelled = true
    }
  }, [
    addFieldRow,
    availabilityKey,
    dispatchFields,
    enableVariants,
    galleryRowKey,
    props.path,
    props.schemaPath,
    removeFieldRow,
    typeIds,
    typeIdsKey,
  ])

  return (
    <div className="variant-visual-galleries-field">
      <div className="variant-visual-galleries-field__guide">
        <p>
          <strong>Variant Types</strong> define dimensions such as Color and Size.{' '}
          <strong>Variant Visual Galleries</strong> store product-specific images for each visual
          option on this product only. <strong>Product Variants</strong> are the purchasable
          combinations generated from those types.
        </p>
        {visualTypeLabel ? (
          <p>
            Showing one gallery per <strong>{visualTypeLabel}</strong> value. All combinations that
            share the same {visualTypeLabel.toLowerCase()} reuse that gallery on the storefront.
          </p>
        ) : null}
      </div>

      <ArrayField {...props} />
    </div>
  )
}

export default VariantVisualGalleriesField
