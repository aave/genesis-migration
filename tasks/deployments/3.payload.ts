import {task} from '@nomiclabs/buidler/config';
import {
  getAaveAdminPerNetwork,
  getAaveStakePerNetwork,
  getAaveTokenProxyPerNetwork,
  getAaveAllowanceForStake,
} from '../../helpers/constants';
import {checkVerification} from '../../helpers/etherscan-verification';
import {setBRE, BRE} from '../../helpers/misc-utils';
import {eContractid, eEthereumNetwork} from '../../helpers/types';
import {verifyConfig} from '../../helpers/verify';

task('deploy-payload', 'Full deployment flow on main network')
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
  .addOptionalParam('lendStrategyAddress', 'Use LEND Strategy Address')
  .addOptionalParam('aaveStrategyAddress', 'Use AAVE Strategy Address')
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
        lendStrategyAddress,
        aaveStrategyAddress,
      },
      _BRE
    ) => {
      setBRE(_BRE);
      const {run} = BRE;
      const {AaveGenesisExecutor, AaveGenesisProposalPayload} = eContractid;
      const network = BRE.network.name as eEthereumNetwork;

      // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
      if (verify) {
        checkVerification();
      }

      await run(`deploy-${AaveGenesisExecutor}`, {
        verify,
        migratorImplAddress,
        migratorProxyAddress,
        aaveImplAddress,
        aaveProxyAddress,
        vaultProxyAddress,
        vaultImplAddress,
        stakeProxyAddress,
      });

      await run(`deploy-${AaveGenesisProposalPayload}`, {
        verify,
        migratorProxyAddress,
        aaveProxyAddress,
        vaultProxyAddress,
        stakeProxyAddress,
        lendStrategyAddress,
        aaveStrategyAddress,
      });
      console.log(`Finished deployment of Payload at ${network} network.`);
    }
  );
