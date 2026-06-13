import type { CollectionConfig } from 'payload'

const placementOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Mobile bottom bar', value: 'bottom' },
  { label: 'Footer', value: 'footer' },
  { label: 'Mobile toolbar', value: 'toolbar' },
]

const iconOptions = [
  { label: 'None', value: 'none' },
  { label: 'Home', value: 'home' },
  { label: 'Grid', value: 'grid' },
  { label: 'Star', value: 'star' },
  { label: 'Heart', value: 'heart' },
  { label: 'User', value: 'user' },
  { label: 'Message', value: 'message' },
  { label: 'Search', value: 'search' },
  { label: 'Menu', value: 'menu' },
  { label: 'Phone', value: 'phone' },
]

export const NavItems: CollectionConfig = {
  slug: 'nav-items',
  labels: {
    singular: 'Nav Item',
    plural: 'Nav Items',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: [
      'label',
      'placements',
      'sortOrder',
      'enabled',
      'showOnDesktop',
      'showOnTablet',
      'showOnMobile',
    ],
    description:
      'Manage navigation links across header, mobile bottom bar, footer, and mobile toolbar. Control device visibility per item.',
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal path (e.g. /search) or full URL (e.g. https://wa.me/123).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'itemType',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Mega menu', value: 'megaMenu' },
            { label: 'Button', value: 'button' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'styleVariant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Icon only', value: 'iconOnly' },
          ],
          admin: {
            width: '50%',
            condition: (_, siblingData) =>
              siblingData?.itemType === 'button' || siblingData?.placements?.includes('toolbar'),
          },
        },
      ],
    },
    {
      name: 'placements',
      type: 'select',
      hasMany: true,
      required: true,
      options: placementOptions,
      admin: {
        description: 'Choose every UI region where this item should appear.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showOnDesktop',
          label: 'Show on Desktop',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '33%' },
        },
        {
          name: 'showOnTablet',
          label: 'Show on Tablet',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '33%' },
        },
        {
          name: 'showOnMobile',
          label: 'Show on Mobile',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '34%' },
        },
      ],
    },
    {
      name: 'children',
      type: 'array',
      labels: {
        singular: 'Sub-link',
        plural: 'Mega menu links',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.itemType === 'megaMenu',
        initCollapsed: false,
        description: 'Links shown in the mega menu dropdown.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within each placement.',
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'none',
      options: iconOptions,
      admin: {
        position: 'sidebar',
        description: 'Icon for bottom bar, toolbar, or button items.',
      },
    },
  ],
}
