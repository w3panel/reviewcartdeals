'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, useFormFields } from '@payloadcms/ui'

import { fetchVariantTypesByIds } from '@/lib/fetchPublishedOptionValues'
import { getVariantOptionTypeIdsFromForm } from '@/lib/productOptionAvailability'
import { resolveVisualGalleryTypeIds } from '@/lib/syncVariantVisualGalleries'

import './VariantVisualGalleriesField.scss'

/** Read-only wrapper — gallery rows sync on the server in beforeValidate when the product is saved. */
const VariantVisualGalleriesField: ArrayFieldClientComponent = (props) => {
  const [visualTypeLabel, setVisualTypeLabel] = useState<string | null>(null)

  const enableVariants = useFormFields(([fields]) => Boolean(fields.enableVariants?.value))
  const variantOptionTypes = useFormFields(([fields]) => fields.variantOptionTypes?.value)

  const typeIds = useMemo(
    () => getVariantOptionTypeIdsFromForm(variantOptionTypes),
    [variantOptionTypes],
  )

  useEffect(() => {
    if (!enableVariants || typeIds.length === 0) {
      setVisualTypeLabel(null)
      return
    }

    let cancelled = false

    void fetchVariantTypesByIds(typeIds).then((types) => {
      if (cancelled) return

      const visualTypeIds = resolveVisualGalleryTypeIds(typeIds, types)
      const primaryType = types.find((type) => visualTypeIds.includes(type.id))
      setVisualTypeLabel(primaryType?.label ?? null)
    })

    return () => {
      cancelled = true
    }
  }, [enableVariants, typeIds])

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
        <p>
          Save the product (or wait for autosave) after changing variant types or available values
          so gallery rows can synchronize.
        </p>
      </div>

      <ArrayField {...props} />
    </div>
  )
}

export default VariantVisualGalleriesField
