import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260605_040917 from './20260605_040917'
import * as migration_20260605_050544_reviews_collection from './20260605_050544_reviews_collection'
import * as migration_20260605_054001_brands_verified from './20260605_054001_brands_verified'
import * as migration_20260606_120000_convert_full_description_to_text from './20260606_120000_convert_full_description_to_text'
import * as migration_20260608_052058 from './20260608_052058'
import * as migration_20260608_120000_remove_variants from './20260608_120000_remove_variants'
import * as migration_20260608_140000_merge_product_description from './20260608_140000_merge_product_description'
import * as migration_20260608_150000_remove_extra_gallery from './20260608_150000_remove_extra_gallery'
import * as migration_20260608_160000_unify_gallery_array from './20260608_160000_unify_gallery_array'
import * as migration_20260610_000000_add_product_variants from './20260610_000000_add_product_variants'
import * as migration_20260610_010000_variant_gallery from './20260610_010000_variant_gallery'
import * as migration_20260610_020000_variant_original_price from './20260610_020000_variant_original_price'
import * as migration_20260610_030000_variant_attributes from './20260610_030000_variant_attributes'
import * as migration_20260610_040000_remove_variant_title from './20260610_040000_remove_variant_title'
import * as migration_20260613_drafts_autosave from './20260613_drafts_autosave'
import * as migration_20260613_draft_nullable_fields from './20260613_draft_nullable_fields'
import * as migration_20260613_fix_draft_child_fks from './20260613_fix_draft_child_fks'
import * as migration_20260614_add_nav_items from './20260614_add_nav_items'
import * as migration_20260615_nav_device_visibility from './20260615_nav_device_visibility'
import * as migration_20260616_reseed_nav_items from './20260616_reseed_nav_items'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260605_040917.up,
    down: migration_20260605_040917.down,
    name: '20260605_040917',
  },
  {
    up: migration_20260605_050544_reviews_collection.up,
    down: migration_20260605_050544_reviews_collection.down,
    name: '20260605_050544_reviews_collection',
  },
  {
    up: migration_20260605_054001_brands_verified.up,
    down: migration_20260605_054001_brands_verified.down,
    name: '20260605_054001_brands_verified',
  },
  {
    up: migration_20260606_120000_convert_full_description_to_text.up,
    down: migration_20260606_120000_convert_full_description_to_text.down,
    name: '20260606_120000_convert_full_description_to_text',
  },
  {
    up: migration_20260608_052058.up,
    down: migration_20260608_052058.down,
    name: '20260608_052058',
  },
  {
    up: migration_20260608_120000_remove_variants.up,
    down: migration_20260608_120000_remove_variants.down,
    name: '20260608_120000_remove_variants',
  },
  {
    up: migration_20260608_140000_merge_product_description.up,
    down: migration_20260608_140000_merge_product_description.down,
    name: '20260608_140000_merge_product_description',
  },
  {
    up: migration_20260608_150000_remove_extra_gallery.up,
    down: migration_20260608_150000_remove_extra_gallery.down,
    name: '20260608_150000_remove_extra_gallery',
  },
  {
    up: migration_20260608_160000_unify_gallery_array.up,
    down: migration_20260608_160000_unify_gallery_array.down,
    name: '20260608_160000_unify_gallery_array',
  },
  {
    up: migration_20260610_000000_add_product_variants.up,
    down: migration_20260610_000000_add_product_variants.down,
    name: '20260610_000000_add_product_variants',
  },
  {
    up: migration_20260610_010000_variant_gallery.up,
    down: migration_20260610_010000_variant_gallery.down,
    name: '20260610_010000_variant_gallery',
  },
  {
    up: migration_20260610_020000_variant_original_price.up,
    down: migration_20260610_020000_variant_original_price.down,
    name: '20260610_020000_variant_original_price',
  },
  {
    up: migration_20260610_030000_variant_attributes.up,
    down: migration_20260610_030000_variant_attributes.down,
    name: '20260610_030000_variant_attributes',
  },
  {
    up: migration_20260610_040000_remove_variant_title.up,
    down: migration_20260610_040000_remove_variant_title.down,
    name: '20260610_040000_remove_variant_title',
  },
  {
    up: migration_20260613_drafts_autosave.up,
    down: migration_20260613_drafts_autosave.down,
    name: '20260613_drafts_autosave',
  },
  {
    up: migration_20260613_draft_nullable_fields.up,
    down: migration_20260613_draft_nullable_fields.down,
    name: '20260613_draft_nullable_fields',
  },
  {
    up: migration_20260613_fix_draft_child_fks.up,
    down: migration_20260613_fix_draft_child_fks.down,
    name: '20260613_fix_draft_child_fks',
  },
  {
    up: migration_20260614_add_nav_items.up,
    down: migration_20260614_add_nav_items.down,
    name: '20260614_add_nav_items',
  },
  {
    up: migration_20260615_nav_device_visibility.up,
    down: migration_20260615_nav_device_visibility.down,
    name: '20260615_nav_device_visibility',
  },
  {
    up: migration_20260616_reseed_nav_items.up,
    down: migration_20260616_reseed_nav_items.down,
    name: '20260616_reseed_nav_items',
  },
]
