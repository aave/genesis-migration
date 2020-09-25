import {task} from '@nomiclabs/buidler/config';
import {deployAaveVoteStrategyToken} from '../../helpers/contracts-helpers';
import {setBRE} from '../../helpers/misc-utils';

task(`deploy-aave-vote-strategy`, `Deploys the token strategies`)
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .addParam('aaveTokenAddress', 'Use Aave Token proxy address')
  .addParam('aaveStakedTokenAddress', 'Use Aave Staked Token proxy address')
  .setAction(async ({aaveTokenAddress, aaveStakedTokenAddress, verify}, BRE) => {
    setBRE(BRE);

    await deployAaveVoteStrategyToken([aaveTokenAddress, aaveStakedTokenAddress], verify);
  });
