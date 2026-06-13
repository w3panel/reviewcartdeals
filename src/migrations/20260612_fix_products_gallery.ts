import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS products_gallery (
      _order INTEGER NOT NULL,
      _parent_id INTEGER NOT NULL,
      id TEXT PRIMARY KEY NOT NULL,
      image_id INTEGER,
      FOREIGN KEY (_parent_id)
        REFERENCES products(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
      FOREIGN KEY (image_id)
        REFERENCES media(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
    );
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS products_gallery_order_idx
    ON products_gallery (_order);
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS products_gallery_parent_id_idx
    ON products_gallery (_parent_id);
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS products_gallery_image_idx
    ON products_gallery (image_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS products_gallery;`)
}
