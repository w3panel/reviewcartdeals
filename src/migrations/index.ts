import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260605_040917 from './20260605_040917';
import * as migration_20260605_050544_reviews_collection from './20260605_050544_reviews_collection';
import * as migration_20260605_054001_brands_verified from './20260605_054001_brands_verified';

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
    name: '20260605_054001_brands_verified'
  },
];
