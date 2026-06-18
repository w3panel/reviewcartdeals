import * as migration_20260615_051642_initial from './20260615_051642_initial'
import * as migration_20260616_variant_option_values from './20260616_variant_option_values'
import * as migration_20260617_134235 from './20260617_134235'
import * as migration_20260617_fix_product_attributes_table_names from './20260617_fix_product_attributes_table_names'
import * as migration_20260617_product_attributes_phase2 from './20260617_product_attributes_phase2'
import * as migration_20260618_option_value_gallery from './20260618_option_value_gallery'
import * as migration_20260619_product_option_availability from './20260619_product_option_availability'
import * as migration_20260620_fix_orphan_option_value_versions from './20260620_fix_orphan_option_value_versions'
import * as migration_20260621_fix_products_rels_option_values from './20260621_fix_products_rels_option_values'
import * as migration_20260622_product_search_fts from './20260622_product_search_fts'
import * as migration_20260624_remove_catalog_variants from './20260624_remove_catalog_variants'
import * as migration_20260625_variant_system_v2 from './20260625_variant_system_v2'
import * as migration_20260626_fix_products_rels_variant_values from './20260626_fix_products_rels_variant_values'
import * as migration_20260627_variant_values_nullable_group from './20260627_variant_values_nullable_group'

export const migrations = [
  {
    up: migration_20260615_051642_initial.up,
    down: migration_20260615_051642_initial.down,
    name: '20260615_051642_initial',
  },
  {
    up: migration_20260616_variant_option_values.up,
    down: migration_20260616_variant_option_values.down,
    name: '20260616_variant_option_values',
  },
  {
    up: migration_20260617_134235.up,
    down: migration_20260617_134235.down,
    name: '20260617_134235',
  },
  {
    up: migration_20260617_fix_product_attributes_table_names.up,
    down: migration_20260617_fix_product_attributes_table_names.down,
    name: '20260617_fix_product_attributes_table_names',
  },
  {
    up: migration_20260617_product_attributes_phase2.up,
    down: migration_20260617_product_attributes_phase2.down,
    name: '20260617_product_attributes_phase2',
  },
  {
    up: migration_20260618_option_value_gallery.up,
    down: migration_20260618_option_value_gallery.down,
    name: '20260618_option_value_gallery',
  },
  {
    up: migration_20260619_product_option_availability.up,
    down: migration_20260619_product_option_availability.down,
    name: '20260619_product_option_availability',
  },
  {
    up: migration_20260620_fix_orphan_option_value_versions.up,
    down: migration_20260620_fix_orphan_option_value_versions.down,
    name: '20260620_fix_orphan_option_value_versions',
  },
  {
    up: migration_20260621_fix_products_rels_option_values.up,
    down: migration_20260621_fix_products_rels_option_values.down,
    name: '20260621_fix_products_rels_option_values',
  },
  {
    up: migration_20260622_product_search_fts.up,
    down: migration_20260622_product_search_fts.down,
    name: '20260622_product_search_fts',
  },
  {
    up: migration_20260624_remove_catalog_variants.up,
    down: migration_20260624_remove_catalog_variants.down,
    name: '20260624_remove_catalog_variants',
  },
  {
    up: migration_20260625_variant_system_v2.up,
    down: migration_20260625_variant_system_v2.down,
    name: '20260625_variant_system_v2',
  },
  {
    up: migration_20260626_fix_products_rels_variant_values.up,
    down: migration_20260626_fix_products_rels_variant_values.down,
    name: '20260626_fix_products_rels_variant_values',
  },
  {
    up: migration_20260627_variant_values_nullable_group.up,
    down: migration_20260627_variant_values_nullable_group.down,
    name: '20260627_variant_values_nullable_group',
  },
]
