'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, useForm, useFormFields } from '@payloadcms/ui'

import { fetchPublishedOptionValueIdsForType } from '@/lib/fetchPublishedOptionValues'
import {
  availabilityRowsEqual,
  buildSyncedAvailabilityRows,
  type AvailabilityRow,
  getVariantOptionTypeIdsFromForm,
  populateDefaultOptionValues,
  rowHasOptionValues,
} from '@/lib/productOptionAvailability'
import { getRelationshipId } from '@/lib/variantOptionValues'

function serializeAvailabilityKey(rows: AvailabilityRow[]): string {
  return rows
    .map((row) => {
      const typeId = getRelationshipId(row.type)
      const valueIds = (row.optionValues ?? [])
        .map((entry) => getRelationshipId(entry))
        .filter((id): id is number => id !== null)
        .sort((left, right) => left - right)
        .join(',')
      return `${typeId ?? 'none'}:${valueIds}`
    })
    .join('|')
}

function buildAvailabilitySyncKey(typeIdsKey: string, rows: AvailabilityRow[]): string {
  return `${typeIdsKey}|${serializeAvailabilityKey(rows)}`
}

const VariantOptionAvailabilityField: ArrayFieldClientComponent = (props) => {
  const { dispatchFields } = useForm()
  const syncingRef = useRef(false)
  const lastSyncedKeyRef = useRef('')

  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))
  const variantOptionTypes = useFormFields(([fields]) => fields.variantOptionTypes?.value)
  const variantOptionAvailability = useFormFields(
    ([fields]) => fields.variantOptionAvailability?.value,
  )

  const typesRef = useRef(variantOptionTypes)
  const availabilityRef = useRef(variantOptionAvailability)
  typesRef.current = variantOptionTypes
  availabilityRef.current = variantOptionAvailability

  const typeIdsKey = useMemo(
    () => getVariantOptionTypeIdsFromForm(variantOptionTypes).join(','),
    [variantOptionTypes],
  )

  const availabilityKey = useMemo(() => {
    const rows = Array.isArray(variantOptionAvailability)
      ? (variantOptionAvailability as AvailabilityRow[])
      : []
    return serializeAvailabilityKey(rows)
  }, [variantOptionAvailability])

  useEffect(() => {
    let cancelled = false

    async function syncRows() {
      if (!enableVariants || syncingRef.current) return

      const typeIds = getVariantOptionTypeIdsFromForm(typesRef.current)
      const currentRows = Array.isArray(availabilityRef.current)
        ? (availabilityRef.current as AvailabilityRow[])
        : []

      const syncKey = buildAvailabilitySyncKey(typeIdsKey, currentRows)
      if (syncKey === lastSyncedKeyRef.current) return

      let nextRows = typeIds.length === 0 ? [] : buildSyncedAvailabilityRows(typeIds, currentRows)

      const needsDefaults = nextRows.some((row) => !rowHasOptionValues(row))
      if (needsDefaults) {
        nextRows = await populateDefaultOptionValues(nextRows, fetchPublishedOptionValueIdsForType)
      }

      if (cancelled) return

      if (availabilityRowsEqual(currentRows, nextRows)) {
        lastSyncedKeyRef.current = buildAvailabilitySyncKey(typeIdsKey, nextRows)
        return
      }

      syncingRef.current = true
      dispatchFields({
        type: 'UPDATE',
        path: 'variantOptionAvailability',
        value: nextRows,
      })
      syncingRef.current = false
      lastSyncedKeyRef.current = buildAvailabilitySyncKey(typeIdsKey, nextRows)
    }

    void syncRows()

    return () => {
      cancelled = true
    }
  }, [availabilityKey, dispatchFields, enableVariants, typeIdsKey])

  return <ArrayField {...props} />
}

export default VariantOptionAvailabilityField
