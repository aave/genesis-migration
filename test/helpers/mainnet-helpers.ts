import {Event, utils} from 'ethers';
import {BRE} from '../../helpers/misc-utils';

const {expect} = require('chai');

export function getHashedProposalType(proposalType: string): string {
  return utils.keccak256(utils.toUtf8Bytes(proposalType));
}

export async function mineBlocks(blocksToMine: number): Promise<void> {
  const prom = [];
  for (let i = 0; i < blocksToMine; i++) {
    prom.push(await BRE.ethers.provider.send('evm_mine', []));
  }
  await Promise.all(prom);
}

export function eventChecker(
  event?: Event,
  eventName?: string,
  expectedSender?: string,
  fieldsToCompare?: object
): void {
  if (!event) throw new Error('no event passed');
  if (!expectedSender || !fieldsToCompare || !eventName)
    throw new Error('no expectedSender, eventName or no fields to compare');
  expect(event.address.toLowerCase()).to.be.equal(
    expectedSender.toLowerCase(),
    `Event was not emitted by ${expectedSender}`
  );
  expect(event.event?.toLowerCase()).to.be.equal(
    eventName.toLowerCase(),
    `Event ${eventName} was not emitted ${expectedSender}`
  );
  Object.keys(fieldsToCompare).forEach((field) => {
    expect(
      event.args && event.args[field] ? event.args[field].toString().toLowerCase() : ''
    ).to.be.equal(
      // @ts-ignore
      fieldsToCompare[field].toString().toLowerCase(),
      `${field} is not correctly set`
    );
  });
}
