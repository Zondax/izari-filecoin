import { ActorsHyperspaceV13, Network } from '../artifacts/index.js'

export const getActorCidsFromNetwork = (network: Network) => {
  switch (network) {
    case Network.Hyperspace:
      return ActorsHyperspaceV13
    case Network.Calibration:
      throw new Error('not implemented yet')
    case Network.Mainnet:
      throw new Error('not implemented yet')
    case Network.Butterfly:
      throw new Error('not implemented yet')
  }
}
