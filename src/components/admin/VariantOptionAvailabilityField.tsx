'use client'

import React from 'react'
import type { ArrayFieldClientComponent } from 'payload'
import { ArrayField } from '@payloadcms/ui'

/** Read-only wrapper — availability rows sync on the server in beforeValidate when the product is saved. */
const VariantOptionAvailabilityField: ArrayFieldClientComponent = (props) => {
  return <ArrayField {...props} />
}

export default VariantOptionAvailabilityField
