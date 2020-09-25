import {TestEnv, makeSuite} from './helpers/make-suite';
import {MOCK_INITIAL_STAKING_DISTRIBUTION} from '../helpers/constants';
import {ethers} from 'ethers';

const {expect} = require('chai');

makeSuite('AaveIncentivesVault', (testEnv: TestEnv) => {
  it('Checks that initialize() of the implementation was executed properly', async () => {
    const {aaveIncentivesVault, mockAave, mockStakedAave} = testEnv;

    expect(
      (await mockAave.allowance(aaveIncentivesVault.address, mockStakedAave.address)).toString()
    ).to.be.equal(MOCK_INITIAL_STAKING_DISTRIBUTION.toString());
  });

  it('It is not possible to send ETH to the proxy of the AaveIncentivesVault', async () => {
    const {aaveIncentivesVault, users} = testEnv;

    await expect(
      users[1].signer.sendTransaction({
        to: aaveIncentivesVault.address,
        value: ethers.utils.parseEther('1'),
      })
    ).to.be.reverted;
  });
});
