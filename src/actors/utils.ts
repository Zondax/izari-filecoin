import { ActorsCalibrationV12, ActorsMainnetV10, Network } from '../artifacts/index.js'

export const getActorCidsFromNetwork = (network: Network) => {
  switch (network) {
    case Network.Calibration:
      return ActorsCalibrationV12
    case Network.Mainnet:
      return ActorsMainnetV10
    case Network.Butterfly:
      throw new Error('not implemented yet')
  }
}
