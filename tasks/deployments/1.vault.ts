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

task('deploy-vault', 'Full deployment flow on main network')
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .setAction(async ({verify}, _BRE) => {
    setBRE(_BRE);
    const {run} = BRE;
    const {AaveIncentivesVault, AaveGenesisExecutor, AaveGenesisProposalPayload} = eContractid;
    const network = BRE.network.name as eEthereumNetwork;

    const admin = getAaveAdminPerNetwork(network);
    const aaveToken = getAaveTokenProxyPerNetwork(network);
    const aaveStake = getAaveStakePerNetwork(network);
    const initialReward = getAaveAllowanceForStake(network);
    const onlyProxy = true;

    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    console.log(`Deploying ${AaveIncentivesVault}...`);

    await run(`deploy-${AaveIncentivesVault}`, {verify});

    await run(`initialize-${AaveIncentivesVault}`, {
      admin,
      onlyProxy,
      aaveToken,
      aaveStake,
      initialReward,
    });
    console.log(`Finished deployment of Vault at ${network} network.`);
  });
