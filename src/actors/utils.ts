import { ActorsCalibrationV11, ActorsMainnetV10, Network } from '../artifacts/index.js'

export const getActorCidsFromNetwork = (network: Network) => {
  switch (network) {
    case Network.Calibration:
      return ActorsCalibrationV11
    case Network.Mainnet:
      return ActorsMainnetV10
    case Network.Butterfly:
      throw new Error('not implemented yet')
  }
}
