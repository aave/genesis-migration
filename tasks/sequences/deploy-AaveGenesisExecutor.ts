import {task} from '@nomiclabs/buidler/config';
import {
  getAaveAdminPerNetwork,
  getAaveAllowanceForStake,
  getAaveIncentivesVaultImplByConfig,
  getAaveIncentivesVaultProxyByConfig,
  getAaveTokenImpl,
  getAaveTokenProxyPerNetwork,
  getLendToAaveMigratorImpl,
  getLendToAaveMigratorProxy,
  getAaveStakePerNetwork,
} from '../../helpers/constants';
import {
  deployAaveGenesisExecutor,
  getAaveIncentivesVault,
  getAaveIncentivesVaultImpl,
} from '../../helpers/contracts-helpers';
import {setBRE} from '../../helpers/misc-utils';
import {eContractid, eEthereumNetwork} from '../../helpers/types';

const {AaveGenesisExecutor} = eContractid;

task(`deploy-${AaveGenesisExecutor}`, `Deploys the ${AaveGenesisExecutor}`)
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .addOptionalParam(
    'migratorImplAddress',
    'Use LendToAaveMigrator Impl address input instead of config'
  )
  .addOptionalParam(
    'migratorProxyAddress',
    'Use LendToAaveMigrator Proxy address input instead of config'
  )
  .addOptionalParam('aaveImplAddress', 'Use AaveToken Impl address input instead of config')
  .addOptionalParam('aaveProxyAddress', 'Use AaveToken Proxy address input instead of config')
  .addParam('vaultProxyAddress', 'Use AaveIncentivesVault Proxy address input instead of config')
  .addParam('vaultImplAddress', 'Use AaveIncentivesVault Proxy address input instead of config')
  .addOptionalParam('stakeProxyAddress', 'Use StakedAave Proxy address input instead of config')
  .setAction(
    async (
      {
        verify,
        migratorImplAddress,
        migratorProxyAddress,
        aaveImplAddress,
        aaveProxyAddress,
        vaultProxyAddress,
        vaultImplAddress,
        stakeProxyAddress,
      },
      BRE
    ) => {
      setBRE(BRE);
      const network = BRE.network.name as eEthereumNetwork;
      const aaveGovernance = getAaveAdminPerNetwork(network);
      const aaveAllowanceForStake = getAaveAllowanceForStake(network);
      const lendToAaveMigratorProxy = migratorProxyAddress || getLendToAaveMigratorProxy(network);
      const lendToAaveMigratorImpl = migratorImplAddress || getLendToAaveMigratorImpl(network);
      const aaveTokenProxy = aaveProxyAddress || getAaveTokenProxyPerNetwork(network);
      const aaveTokenImpl = aaveImplAddress || getAaveTokenImpl(network);
      const aaveIncentivesVaultProxy = vaultProxyAddress;
      const aaveIncentivesVaultImpl = vaultImplAddress;
      const stakedAaveProxy = stakeProxyAddress || getAaveStakePerNetwork(network);

      await deployAaveGenesisExecutor(
        [
          aaveGovernance,
          aaveAllowanceForStake,
          lendToAaveMigratorProxy,
          lendToAaveMigratorImpl,
          aaveTokenProxy,
          aaveTokenImpl,
          aaveIncentivesVaultProxy,
          aaveIncentivesVaultImpl,
          stakedAaveProxy,
        ],
        verify
      );
    }
  );
