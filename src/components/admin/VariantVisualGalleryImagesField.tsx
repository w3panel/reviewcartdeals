'use client'

import React from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField, Button, useField, useForm } from '@payloadcms/ui'

type GalleryImagesFieldProps = React.ComponentProps<ArrayFieldClientComponent>

function resolveSchemaPath(props: GalleryImagesFieldProps): string {
  if (props.schemaPath) return props.schemaPath
  if (props.path.endsWith('.gallery')) {
    return props.path.replace(/\.\d+\.gallery$/, '.gallery')
  }
  return 'variantVisualGalleries.gallery'
}

function GalleryImagesField(props: GalleryImagesFieldProps) {
  const { addFieldRow } = useForm()

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

  const handleAddImage = () => {
    addFieldRow({
      path: props.path,
      schemaPath,
    })
  }

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
