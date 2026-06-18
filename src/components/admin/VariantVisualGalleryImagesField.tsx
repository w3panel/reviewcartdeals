'use client'

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, Button, useField, useForm } from '@payloadcms/ui'

import { getRelationshipId } from '@/lib/variantOptionValues'

type GalleryImagesFieldProps = React.ComponentProps<ArrayFieldClientComponent>

function resolveSchemaPath(props: GalleryImagesFieldProps): string {
  if (props.schemaPath) return props.schemaPath
  if (props.path.endsWith('.gallery')) {
    return props.path.replace(/\.\d+\.gallery$/, '.gallery')
  }
  return 'variantVisualGalleries.gallery'
}

function GalleryImagesField(props: GalleryImagesFieldProps) {
  const { addFieldRow, removeFieldRow } = useForm()
  const isPruningRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  const { rows = [] } = useField({
    path: props.path,
    hasRows: true,
  })

  const schemaPath = resolveSchemaPath(props)

  const arrayFieldProps: GalleryImagesFieldProps = {
    path: props.path,
    field: {
      ...props.field,
      minRows: 0,
      required: false,
    },
    permissions: props.permissions,
    readOnly: props.readOnly,
    schemaPath,
  }

  const galleryRowCount = rows.length

  const removePhantomEmptyRows = useCallback(() => {
    if (isPruningRef.current || galleryRowCount === 0) return

    const emptyIndices = rows
      .map((row, index) => {
        const imageFromRow = getRelationshipId((row as { image?: unknown })?.image)
        return imageFromRow === null ? index : -1
      })
      .filter((index) => index >= 0)

    if (emptyIndices.length <= 1) return

    isPruningRef.current = true
    for (let index = emptyIndices.length - 1; index >= 0; index--) {
      removeFieldRow({ path: props.path, rowIndex: emptyIndices[index] })
    }
    isPruningRef.current = false
  }, [galleryRowCount, props.path, removeFieldRow, rows])

  useLayoutEffect(() => {
    removePhantomEmptyRows()
    setIsReady(true)
  }, [galleryRowCount, removePhantomEmptyRows])

  const handleAddImage = () => {
    addFieldRow({
      path: props.path,
      schemaPath,
    })
  }

  if (!isReady) return null

  const showEmptyState = rows.length === 0

  return (
    <div className="variant-visual-gallery-images">
      {showEmptyState ? (
        <div className="variant-visual-gallery-images__empty-state">
          <p className="variant-visual-gallery-images__empty">No images uploaded yet.</p>
          <Button
            buttonStyle="secondary"
            disabled={Boolean(props.readOnly)}
            onClick={handleAddImage}
          >
            Add Image
          </Button>
        </div>
      ) : null}

      <div
        className={showEmptyState ? 'variant-visual-gallery-images__array-host--hidden' : undefined}
      >
        <ArrayField {...arrayFieldProps} />
      </div>

      {!showEmptyState ? (
        <div className="variant-visual-gallery-images__actions">
          <Button
            buttonStyle="secondary"
            disabled={Boolean(props.readOnly)}
            onClick={handleAddImage}
          >
            Add Image
          </Button>
        </div>
      ) : null}
    </div>
  )
}

const VariantVisualGalleryImagesField: ArrayFieldClientComponent = (props) => {
  return <GalleryImagesField {...props} />
}

export default VariantVisualGalleryImagesField
