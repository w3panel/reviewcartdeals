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
]
