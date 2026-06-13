import { sql } from '@payloadcms/db-d1-sqlite'
import type { MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

export async function seedDefaultNavItems(db: MigrateUpArgs['db']): Promise<void> {
  const whatsappHref = 'https://wa.me/1234567890'

  await db.run(sql`DELETE FROM \`nav_items_children\`;`)
  await db.run(sql`DELETE FROM \`nav_items_placements\`;`)
  await db.run(sql`DELETE FROM \`nav_items\`;`)

  await db.run(sql`INSERT INTO \`nav_items\` (
    \`id\`, \`label\`, \`href\`, \`item_type\`, \`style_variant\`,
    \`show_on_desktop\`, \`show_on_tablet\`, \`show_on_mobile\`,
    \`enabled\`, \`sort_order\`, \`open_in_new_tab\`, \`icon\`
  ) VALUES
    (1, 'Home', '/', 'link', 'default', 1, 1, 1, 1, 0, 0, 'home'),
    (2, 'Categories', '/search', 'link', 'default', 1, 1, 1, 1, 1, 0, 'grid'),
    (3, 'Collections', '#', 'megaMenu', 'default', 1, 1, 0, 1, 2, 0, 'menu'),
    (4, 'Reviews', '/search', 'link', 'default', 0, 1, 1, 1, 3, 0, 'star'),
    (5, 'Saved', '/liked', 'link', 'default', 0, 1, 1, 1, 4, 0, 'heart'),
    (6, 'Profile', '/cart', 'link', 'default', 0, 1, 1, 1, 5, 0, 'user'),
    (7, 'Contact Us', '/search', 'link', 'default', 1, 1, 1, 1, 6, 0, 'phone'),
    (8, 'WhatsApp', ${whatsappHref}, 'button', 'whatsapp', 0, 0, 1, 1, 0, 1, 'message')
  `)

  await db.run(sql`INSERT INTO \`nav_items_placements\` (\`order\`, \`parent_id\`, \`value\`, \`id\`) VALUES
    (1, 1, 'header', 101),
    (2, 1, 'bottom', 102),
    (1, 2, 'header', 201),
    (2, 2, 'bottom', 202),
    (1, 3, 'header', 301),
    (1, 4, 'bottom', 401),
    (1, 5, 'bottom', 501),
    (1, 6, 'bottom', 601),
    (1, 7, 'header', 701),
    (2, 7, 'footer', 702),
    (1, 8, 'toolbar', 801)
  `)

  await db.run(sql`INSERT INTO \`nav_items_children\` (\`_order\`, \`_parent_id\`, \`id\`, \`label\`, \`href\`, \`open_in_new_tab\`) VALUES
    (1, 3, 'mega-1', 'Watches', '/search?category=watches', 0),
    (2, 3, 'mega-2', 'Wallets', '/search?category=wallets', 0),
    (3, 3, 'mega-3', 'Bags', '/search?category=bags', 0),
    (4, 3, 'mega-4', 'View All', '/search', 0)
  `)
}
