import * as migration_20260615_051642_initial from './20260615_051642_initial'

export const migrations = [
  {
    up: migration_20260615_051642_initial.up,
    down: migration_20260615_051642_initial.down,
    name: '20260615_051642_initial',
  },
]
