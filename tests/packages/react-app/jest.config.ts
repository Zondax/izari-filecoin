import type { Config } from '@jest/types'

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  resolver: 'jest-ts-webcompat-resolver',
  setupFiles: ['dotenv/config'],
}

export default config
