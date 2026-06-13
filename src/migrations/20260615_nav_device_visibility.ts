import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

async function columnExists(
  db: MigrateUpArgs['db'],
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM pragma_table_info(${table}) WHERE name = ${column}`,
  )
  return rows.length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const hasNewSchema = await columnExists(db, 'nav_items', 'item_type')
  if (hasNewSchema && (await tableExists(db, 'nav_items_placements'))) {
    return
  }

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`nav_items_children\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`href\` text,
    \`open_in_new_tab\` integer DEFAULT false,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`nav_items_children_order_idx\` ON \`nav_items_children\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`nav_items_children_parent_id_idx\` ON \`nav_items_children\` (\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`nav_items_placements\` (
    \`order\` integer NOT NULL,
    \`parent_id\` integer NOT NULL,
    \`value\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`nav_items_placements_order_idx\` ON \`nav_items_placements\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`nav_items_placements_parent_idx\` ON \`nav_items_placements\` (\`parent_id\`);`,
  )

  if (!(await columnExists(db, 'nav_items', 'item_type'))) {
    await db.run(sql`ALTER TABLE \`nav_items\` ADD \`item_type\` text DEFAULT 'link';`)
    await db.run(sql`ALTER TABLE \`nav_items\` ADD \`style_variant\` text DEFAULT 'default';`)
    await db.run(sql`ALTER TABLE \`nav_items\` ADD \`show_on_desktop\` integer DEFAULT true;`)
    await db.run(sql`ALTER TABLE \`nav_items\` ADD \`show_on_tablet\` integer DEFAULT true;`)
    await db.run(sql`ALTER TABLE \`nav_items\` ADD \`show_on_mobile\` integer DEFAULT true;`)
  }

  if (await columnExists(db, 'nav_items', 'placement')) {
    await db.run(sql`
      INSERT INTO \`nav_items_placements\` (\`order\`, \`parent_id\`, \`value\`, \`id\`)
      SELECT 1, \`id\`, \`placement\`, \`id\` * 100
      FROM \`nav_items\`
      WHERE \`placement\` IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM \`nav_items_placements\` p WHERE p.\`parent_id\` = \`nav_items\`.\`id\`
        )
    `)

    await db.run(sql`PRAGMA foreign_keys=OFF;`)
    await db.run(sql`CREATE TABLE \`__new_nav_items\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`label\` text NOT NULL,
      \`href\` text NOT NULL,
      \`item_type\` text DEFAULT 'link',
      \`style_variant\` text DEFAULT 'default',
      \`show_on_desktop\` integer DEFAULT true,
      \`show_on_tablet\` integer DEFAULT true,
      \`show_on_mobile\` integer DEFAULT true,
      \`enabled\` integer DEFAULT true,
      \`sort_order\` numeric DEFAULT 0 NOT NULL,
      \`open_in_new_tab\` integer DEFAULT false,
      \`icon\` text DEFAULT 'none',
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );`)
    await db.run(sql`
      INSERT INTO \`__new_nav_items\` (
        \`id\`, \`label\`, \`href\`, \`item_type\`, \`style_variant\`,
        \`show_on_desktop\`, \`show_on_tablet\`, \`show_on_mobile\`,
        \`enabled\`, \`sort_order\`, \`open_in_new_tab\`, \`icon\`,
        \`updated_at\`, \`created_at\`
      )
      SELECT
        \`id\`, \`label\`, \`href\`, COALESCE(\`item_type\`, 'link'), COALESCE(\`style_variant\`, 'default'),
        COALESCE(\`show_on_desktop\`, 1), COALESCE(\`show_on_tablet\`, 1), COALESCE(\`show_on_mobile\`, 1),
        \`enabled\`, \`sort_order\`, \`open_in_new_tab\`, \`icon\`,
        \`updated_at\`, \`created_at\`
      FROM \`nav_items\`
    `)
    await db.run(sql`DROP TABLE \`nav_items\`;`)
    await db.run(sql`ALTER TABLE \`__new_nav_items\` RENAME TO \`nav_items\`;`)
    await db.run(sql`PRAGMA foreign_keys=ON;`)

    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`nav_items_updated_at_idx\` ON \`nav_items\` (\`updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`nav_items_created_at_idx\` ON \`nav_items\` (\`created_at\`);`,
    )
    await db.run(sql`DROP INDEX IF EXISTS \`nav_items_placement_idx\`;`)
    await db.run(sql`DROP INDEX IF EXISTS \`nav_items_sort_order_idx\`;`)
    await db.run(sql`DROP INDEX IF EXISTS \`nav_items_enabled_idx\`;`)
  }

  const existing = await db.all<{ count: number }>(sql`SELECT COUNT(*) as count FROM \`nav_items\``)
  const count = existing[0]?.count ?? 0

  if (count <= 1) {
    await db.run(sql`DELETE FROM \`nav_items_children\`;`)
    await db.run(sql`DELETE FROM \`nav_items_placements\`;`)
    await db.run(sql`DELETE FROM \`nav_items\`;`)

    const whatsappHref = 'https://wa.me/1234567890'

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
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`nav_items_children\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`nav_items_placements\`;`)

  if (await columnExists(db, 'nav_items', 'item_type')) {
    await db.run(sql`PRAGMA foreign_keys=OFF;`)
    await db.run(sql`CREATE TABLE \`__old_nav_items\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`label\` text NOT NULL,
      \`href\` text NOT NULL,
      \`placement\` text DEFAULT 'header' NOT NULL,
      \`enabled\` integer DEFAULT true,
      \`sort_order\` numeric DEFAULT 0 NOT NULL,
      \`open_in_new_tab\` integer DEFAULT false,
      \`icon\` text DEFAULT 'none',
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );`)
    await db.run(sql`
      INSERT INTO \`__old_nav_items\` (
        \`id\`, \`label\`, \`href\`, \`placement\`, \`enabled\`, \`sort_order\`,
        \`open_in_new_tab\`, \`icon\`, \`updated_at\`, \`created_at\`
      )
      SELECT
        n.\`id\`, n.\`label\`, n.\`href\`, COALESCE(p.\`value\`, 'header'), n.\`enabled\`, n.\`sort_order\`,
        n.\`open_in_new_tab\`, n.\`icon\`, n.\`updated_at\`, n.\`created_at\`
      FROM \`nav_items\` n
      LEFT JOIN \`nav_items_placements\` p ON p.\`parent_id\` = n.\`id\` AND p.\`order\` = 1
    `)
    await db.run(sql`DROP TABLE \`nav_items\`;`)
    await db.run(sql`ALTER TABLE \`__old_nav_items\` RENAME TO \`nav_items\`;`)
    await db.run(sql`PRAGMA foreign_keys=ON;`)
    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`nav_items_sort_order_idx\` ON \`nav_items\` (\`sort_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`nav_items_placement_idx\` ON \`nav_items\` (\`placement\`);`,
    )
    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`nav_items_enabled_idx\` ON \`nav_items\` (\`enabled\`);`,
    )
  }
}
