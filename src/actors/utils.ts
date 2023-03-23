import { ActorsCalibrationV10, ActorsHyperspaceV13, ActorsMainnetV10, Network } from '../artifacts/index.js'

export const getActorCidsFromNetwork = (network: Network) => {
  switch (network) {
    case Network.Hyperspace:
      return ActorsHyperspaceV13
    case Network.Calibration:
      return ActorsCalibrationV10
    case Network.Mainnet:
      return ActorsMainnetV10
    case Network.Butterfly:
      throw new Error('not implemented yet')
  }
}
