---
sidebar_position: 6
---
# contractPositionFetcher - fetching non-tokenized positions

Now, lets important relevant positions that are not tokenized. For Pickle Finance, an example of this would be their farms.

To get started, create a new file in the Polygon folder, named pickle.farm.contract-position-fetcher.ts.  <!--TODO explain naming convention -->

The first thing we'll do is import relevant packages for the tokenFetcher
<!--TODO explain packages -->
<!--TODO remove helper from code -->

``` ts
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { ZERO_ADDRESS } from '~constants/common';
import { MasterChefContractPositionHelper } from '~position/helpers/master-chef.contract-position-helper';
import { MasterChefDefaultRewardsPerBlockStrategy } from '~position/helpers/master-chef.default.reward-token-rewards-per-block-strategy';
import { MasterChefRewarderClaimableTokenStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-strategy';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import {
  PositionFetcher,
  ContractPosition,
  DefaultDataProps,
  ContractType,
} from '~position/position-fetcher.interface';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';
```

Next, we will register the positionFetcher with our application
<!--explain what we are registering -->
<!--TODO remove helper from code -->
``` ts
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { ZERO_ADDRESS } from '~constants/common';
import { MasterChefContractPositionHelper } from '~position/helpers/master-chef.contract-position-helper';
import { MasterChefDefaultRewardsPerBlockStrategy } from '~position/helpers/master-chef.default.reward-token-rewards-per-block-strategy';
import { MasterChefRewarderClaimableTokenStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-strategy';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import {
  PositionFetcher,
  ContractPosition,
  DefaultDataProps,
  ContractType,
} from '~position/position-fetcher.interface';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
  network: Network.POLYGON_MAINNET,
  type: ContractType.POSITION,
})
```

Next, we will add in the export class <!--TODO explain this -->
<!--TODO remove helper from code -->
``` ts
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { ZERO_ADDRESS } from '~constants/common';
import { MasterChefContractPositionHelper } from '~position/helpers/master-chef.contract-position-helper';
import { MasterChefDefaultRewardsPerBlockStrategy } from '~position/helpers/master-chef.default.reward-token-rewards-per-block-strategy';
import { MasterChefRewarderClaimableTokenStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-strategy';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import {
  PositionFetcher,
  ContractPosition,
  DefaultDataProps,
  ContractType,
} from '~position/position-fetcher.interface';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
  network: Network.POLYGON_MAINNET,
  type: ContractType.POSITION,
})
export class PolygonPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(MasterChefContractPositionHelper)
    private readonly masterchefFarmContractPositionHelper: MasterChefContractPositionHelper,
    @Inject(MasterChefDefaultRewardsPerBlockStrategy)
    private readonly masterChefDefaultRewardsPerBlockStrategy: MasterChefDefaultRewardsPerBlockStrategy,
    @Inject(PickleContractFactory) private readonly contractFactory: PickleContractFactory,
    @Inject(MasterChefRewarderClaimableTokenStrategy)
    private readonly masterChefRewarderClaimableTokenStrategy: MasterChefRewarderClaimableTokenStrategy,
  ) {}
```

Lastly, we will define how the tokenFetcher should get positions, xxxx
<!--TODO remove helper from code -->
```ts
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { ZERO_ADDRESS } from '~constants/common';
import { MasterChefContractPositionHelper } from '~position/helpers/master-chef.contract-position-helper';
import { MasterChefDefaultRewardsPerBlockStrategy } from '~position/helpers/master-chef.default.reward-token-rewards-per-block-strategy';
import { MasterChefRewarderClaimableTokenStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-strategy';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import {
  PositionFetcher,
  ContractPosition,
  DefaultDataProps,
  ContractType,
} from '~position/position-fetcher.interface';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
  network: Network.POLYGON_MAINNET,
  type: ContractType.POSITION,
})
export class PolygonPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(MasterChefContractPositionHelper)
    private readonly masterchefFarmContractPositionHelper: MasterChefContractPositionHelper,
    @Inject(MasterChefDefaultRewardsPerBlockStrategy)
    private readonly masterChefDefaultRewardsPerBlockStrategy: MasterChefDefaultRewardsPerBlockStrategy,
    @Inject(PickleContractFactory) private readonly contractFactory: PickleContractFactory,
    @Inject(MasterChefRewarderClaimableTokenStrategy)
    private readonly masterChefRewarderClaimableTokenStrategy: MasterChefRewarderClaimableTokenStrategy,
  ) {}

  async getPositions(): Promise<ContractPosition<DefaultDataProps>[]> {
    const network = Network.POLYGON_MAINNET;

    return this.masterchefFarmContractPositionHelper.getContractPositions<PickleMiniChefV2>({
      address: '0x20b2a3fc7b13ca0ccf7af81a68a14cb3116e8749',
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
      network,
      dependencies: [{ appId: PICKLE_DEFINITION.id, groupIds: [PICKLE_DEFINITION.groups.jar], network }],
      resolveContract: ({ address, network }) =>
        this.contractFactory.pickleMiniChefV2({
          network,
          address,
        }),
      resolvePoolLength: ({ multicall, contract }) => multicall.prepare(contract).poolLength(),
      resolveDepositTokenAddress: ({ poolIndex, contract, multicall }) =>
        multicall.prepare(contract).lpToken(poolIndex),
      resolveRewardTokenAddresses: this.masterChefRewarderClaimableTokenStrategy.build<
        PickleMiniChefV2,
        PickleRewarder
      >({
        resolvePrimaryClaimableToken: ({ multicall, contract }) => multicall.prepare(contract).PICKLE(),
        resolveRewarderAddress: ({ multicall, contract, poolIndex }) => multicall.prepare(contract).rewarder(poolIndex),
        resolveRewarderContract: ({ network, rewarderAddress }) =>
          this.contractFactory.pickleRewarder({ address: rewarderAddress, network }),
        resolveSecondaryClaimableToken: ({ multicall, poolIndex, rewarderContract }) =>
          multicall
            .prepare(rewarderContract)
            .pendingTokens(poolIndex, ZERO_ADDRESS, 0)
            .then(v => v.rewardTokens[0]),
      }),
      // @TODO Support multi-reward ROIs
      resolveRewardsPerBlock: this.masterChefDefaultRewardsPerBlockStrategy.build({
        resolvePoolAllocPoints: async ({ poolIndex, contract, multicall }) =>
          multicall
            .prepare(contract)
            .poolInfo(poolIndex)
            .then(v => v.allocPoint),
        resolveTotalAllocPoints: ({ multicall, contract }) => multicall.prepare(contract).totalAllocPoint(),
        resolveTotalRewardPerBlock: ({ multicall, contract }) => multicall.prepare(contract).picklePerSecond(),
      }),
    });
  }
}
```
With that, we have imported our non-tokenized positions into Zapper.

Now, lets write a balanceFetcher to pull in relevant balances for tokenized and non-tokenized positions
