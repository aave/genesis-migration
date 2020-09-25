import {exit} from 'process';
import {getAaveIncentivesVaultProxyByConfig} from './constants';
import {eEthereumNetwork} from './types';

export const verifyConfig = (network: eEthereumNetwork) => {
  const aaveIncentivesVaultProxy = getAaveIncentivesVaultProxyByConfig(network);
  const aaveIncentivesVaultImpl = getAaveIncentivesVaultProxyByConfig(network);

  if (!aaveIncentivesVaultProxy) {
    console.error(
      'AaveIncentivesVault Proxy is missing at helpers/constants.ts configuration file'
    );
    exit(4);
  }
  if (!aaveIncentivesVaultImpl) {
    console.error(
      'AaveIncentivesVault Implementation is missing at helpers/constants.ts configuration file'
    );
    exit(5);
  }
};
