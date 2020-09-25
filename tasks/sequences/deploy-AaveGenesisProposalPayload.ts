import {task} from '@nomiclabs/buidler/config';
import {
  getAaveTokenProxyPerNetwork,
  getActivationBlockDelay,
  getAssetVotingWeightProvider,
  getLendToAaveMigratorProxy,
  getAaveStakePerNetwork,
  getLendVoteStrategyTokenByNetwork,
} from '../../helpers/constants';
import {
  deployAaveGenesisProposalPayload,
  getAaveGenesisExecutor,
  getAaveIncentivesVault,
  getAaveVoteStrategyToken,
} from '../../helpers/contracts-helpers';
import {setBRE} from '../../helpers/misc-utils';
import {eContractid, eEthereumNetwork} from '../../helpers/types';

const {AaveGenesisProposalPayload} = eContractid;

task(`deploy-${AaveGenesisProposalPayload}`, `Deploys the ${AaveGenesisProposalPayload}`)
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .addFlag('useConfig', 'Retrieve AaveIncentivesVault addresses from helpers/constants.ts')
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
  .addOptionalParam('stakeProxyAddress', 'Use StakedAave Proxy address input instead of config')
  .addOptionalParam('lendStrategyAddress', 'Use LEND Strategy Address')
  .addOptionalParam('aaveStrategyAddress', 'Use AAVE Strategy Address')
  .setAction(
    async (
      {
        verify,
        migratorProxyAddress,
        aaveProxyAddress,
        vaultProxyAddress,
        stakeProxyAddress,
        lendStrategyAddress,
        aaveStrategyAddress,
      },
      BRE
    ) => {
      setBRE(BRE);
      const network = BRE.network.name as eEthereumNetwork;

      const activationBlockDelay = getActivationBlockDelay(network);
      const assetVotingWeightProvider = getAssetVotingWeightProvider(network);
      const aaveGenesisExecutor = await getAaveGenesisExecutor();
      const lendToAaveMigratorProxy = migratorProxyAddress || getLendToAaveMigratorProxy(network);
      const aaveTokenProxy = aaveProxyAddress || getAaveTokenProxyPerNetwork(network);
      const aaveIncentivesVaultProxyAddress = vaultProxyAddress;
      const stakedAaveProxy = stakeProxyAddress || getAaveStakePerNetwork(network);
      const lendVoteStrategyAddress =
        lendStrategyAddress || getLendVoteStrategyTokenByNetwork(network);
      const aaveVoteStrategyAddress =
        aaveStrategyAddress || (await getAaveVoteStrategyToken()).address;

      await deployAaveGenesisProposalPayload(
        [
          activationBlockDelay,
          assetVotingWeightProvider,
          aaveGenesisExecutor.address,
          lendToAaveMigratorProxy,
          aaveTokenProxy,
          aaveIncentivesVaultProxyAddress,
          stakedAaveProxy,
          lendVoteStrategyAddress,
          aaveVoteStrategyAddress,
        ],
        verify
      );
    }
  );
