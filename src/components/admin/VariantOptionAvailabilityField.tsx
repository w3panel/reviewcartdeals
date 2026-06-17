'use client'

import React, { useEffect, useRef } from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, useForm, useFormFields } from '@payloadcms/ui'

import { fetchPublishedOptionValueIdsForType } from '@/lib/fetchPublishedOptionValues'
import {
  buildSyncedAvailabilityRows,
  type AvailabilityRow,
  getVariantOptionTypeIdsFromForm,
  populateDefaultOptionValues,
} from '@/lib/productOptionAvailability'
import { getRelationshipId } from '@/lib/variantOptionValues'

function rowsEqual(left: AvailabilityRow[], right: AvailabilityRow[]): boolean {
  if (left.length !== right.length) return false

  return left.every((row, index) => {
    const other = right[index]
    const typeId = getRelationshipId(row.type)
    const otherTypeId = getRelationshipId(other?.type)
    if (typeId !== otherTypeId) return false

    const valueIds = (row.optionValues ?? [])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => id !== null)
    const otherValueIds = (other?.optionValues ?? [])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => id !== null)

    if (valueIds.length !== otherValueIds.length) return false
    return valueIds.every((id, valueIndex) => id === otherValueIds[valueIndex])
  })
}

const VariantOptionAvailabilityField: ArrayFieldClientComponent = (props) => {
  const { dispatchFields } = useForm()
  const syncingRef = useRef(false)

  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))
  const variantOptionTypes = useFormFields(([fields]) => fields.variantOptionTypes?.value)
  const variantOptionAvailability = useFormFields(
    ([fields]) => fields.variantOptionAvailability?.value,
  )

  useEffect(() => {
    let cancelled = false

    async function syncRows() {
      if (!enableVariants || syncingRef.current) return

      const typeIds = getVariantOptionTypeIdsFromForm(variantOptionTypes)
      const currentRows = Array.isArray(variantOptionAvailability)
        ? (variantOptionAvailability as AvailabilityRow[])
        : []

      let nextRows = typeIds.length === 0 ? [] : buildSyncedAvailabilityRows(typeIds, currentRows)

      nextRows = await populateDefaultOptionValues(nextRows, fetchPublishedOptionValueIdsForType)

      if (cancelled || rowsEqual(currentRows, nextRows)) return

      syncingRef.current = true
      dispatchFields({
        type: 'UPDATE',
        path: 'variantOptionAvailability',
        value: nextRows,
      })
      syncingRef.current = false
    }

    void syncRows()

    return () => {
      cancelled = true
    }
  }, [dispatchFields, enableVariants, variantOptionAvailability, variantOptionTypes])

  return <ArrayField {...props} />
}

export default VariantOptionAvailabilityField
