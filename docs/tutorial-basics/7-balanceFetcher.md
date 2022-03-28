---
sidebar_position: 6
---
# balanceFetcher - fetching balances for a users positions

Now that we've written our contractPositionFetcher and tokenFetcher for our app, we need to write a fetcher for how to get the balances for them. This will follow a similar structure to the other 2 fetchers.

First, create a file called pickle.balance-fetcher.ts

In this file, we again will important relevant packages
<!--TODO explain further -->

```
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { AppsV3BalanceFetcher } from '~balance/fetchers/balance-fetcher.decorator';
import { BalanceFetcherV3, buildBalanceFetcherV3Response } from '~position/balance-fetcher.utils';
import { MasterChefContractPositionBalanceHelper } from '~position/helpers/master-chef.contract-position-balance-helper';
import { MasterChefDefaultStakedBalanceStrategy } from '~position/helpers/master-chef.default.staked-token-balance-strategy';
import { MasterChefRewarderClaimableBalanceStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-balances-strategy';
import { TokenBalanceHelper } from '~position/helpers/token-balance.helper';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@AppsV3BalanceFetcher(PICKLE_DEFINITION.id, Network.POLYGON_MAINNET)
```

Next, we'll again define our export class
<!--TODO explain further -->
<!--get rid of helpers -->


```
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { AppsV3BalanceFetcher } from '~balance/fetchers/balance-fetcher.decorator';
import { BalanceFetcherV3, buildBalanceFetcherV3Response } from '~position/balance-fetcher.utils';
import { MasterChefContractPositionBalanceHelper } from '~position/helpers/master-chef.contract-position-balance-helper';
import { MasterChefDefaultStakedBalanceStrategy } from '~position/helpers/master-chef.default.staked-token-balance-strategy';
import { MasterChefRewarderClaimableBalanceStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-balances-strategy';
import { TokenBalanceHelper } from '~position/helpers/token-balance.helper';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@AppsV3BalanceFetcher(PICKLE_DEFINITION.id, Network.POLYGON_MAINNET)
export class PolygonPickleBalanceFetcher implements BalanceFetcherV3 {
  constructor(
    @Inject(TokenBalanceHelper) private readonly tokenBalanceHelper: TokenBalanceHelper,
    @Inject(MasterChefContractPositionBalanceHelper)
    private readonly masterChefFarmContractPositionBalanceHelper: MasterChefContractPositionBalanceHelper,
    @Inject(MasterChefDefaultStakedBalanceStrategy)
    private readonly masterChefFarmContractPositionDefaultStakedBalanceStrategy: MasterChefDefaultStakedBalanceStrategy,
    @Inject(MasterChefRewarderClaimableBalanceStrategy)
    private readonly masterChefRewarderClaimableBalanceStrategy: MasterChefRewarderClaimableBalanceStrategy,
    @Inject(PickleContractFactory) private readonly contractFactory: PickleContractFactory,
  ) {}
```

define getJarBalances first, to get our tokenized positions
<!--TODO explain further -->
<!--get rid of helpers -->

```
  private async getJarBalances(address: string) {
    return await this.tokenBalanceHelper.getTokenBalances({
      network: Network.POLYGON_MAINNET,
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.jar,
      address,
    });
  }
```

Next, we'll define how to get balances for our non-tokenized farm positions on Pickle
<!--TODO explain further -->
<!--get rid of helpers -->

```
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { AppsV3BalanceFetcher } from '~balance/fetchers/balance-fetcher.decorator';
import { BalanceFetcherV3, buildBalanceFetcherV3Response } from '~position/balance-fetcher.utils';
import { MasterChefContractPositionBalanceHelper } from '~position/helpers/master-chef.contract-position-balance-helper';
import { MasterChefDefaultStakedBalanceStrategy } from '~position/helpers/master-chef.default.staked-token-balance-strategy';
import { MasterChefRewarderClaimableBalanceStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-balances-strategy';
import { TokenBalanceHelper } from '~position/helpers/token-balance.helper';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@AppsV3BalanceFetcher(PICKLE_DEFINITION.id, Network.POLYGON_MAINNET)
export class PolygonPickleBalanceFetcher implements BalanceFetcherV3 {
  constructor(
    @Inject(TokenBalanceHelper) private readonly tokenBalanceHelper: TokenBalanceHelper,
    @Inject(MasterChefContractPositionBalanceHelper)
    private readonly masterChefFarmContractPositionBalanceHelper: MasterChefContractPositionBalanceHelper,
    @Inject(MasterChefDefaultStakedBalanceStrategy)
    private readonly masterChefFarmContractPositionDefaultStakedBalanceStrategy: MasterChefDefaultStakedBalanceStrategy,
    @Inject(MasterChefRewarderClaimableBalanceStrategy)
    private readonly masterChefRewarderClaimableBalanceStrategy: MasterChefRewarderClaimableBalanceStrategy,
    @Inject(PickleContractFactory) private readonly contractFactory: PickleContractFactory,
  ) {}

  private async getJarBalances(address: string) {
    return await this.tokenBalanceHelper.getTokenBalances({
      network: Network.POLYGON_MAINNET,
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.jar,
      address,
    });
  }

  private async getFarmBalances(address: string) {
    const network = Network.POLYGON_MAINNET;

    return this.masterChefFarmContractPositionBalanceHelper.getBalances<PickleMiniChefV2>({
      address,
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
      network,
      resolveChefContract: ({ contractAddress, network }) =>
        this.contractFactory.pickleMiniChefV2({ network, address: contractAddress }),
      resolveStakedTokenBalance: this.masterChefFarmContractPositionDefaultStakedBalanceStrategy.build({
        resolveStakedBalance: ({ contract, multicall, contractPosition }) =>
          multicall
            .prepare(contract)
            .userInfo(contractPosition.dataProps.poolIndex, address)
            .then(v => v.amount),
      }),
      resolveClaimableTokenBalances: this.masterChefRewarderClaimableBalanceStrategy.build<
        PickleMiniChefV2,
        PickleRewarder
      >({
        resolvePrimaryClaimableBalance: ({ multicall, contract, contractPosition, address }) =>
          multicall.prepare(contract).pendingPickle(contractPosition.dataProps.poolIndex, address),
        resolveRewarderAddress: ({ contract, contractPosition, multicall }) =>
          multicall.prepare(contract).rewarder(contractPosition.dataProps.poolIndex),
        resolveRewarderContract: ({ network, rewarderAddress }) =>
          this.contractFactory.pickleRewarder({ address: rewarderAddress, network }),
        resolveSecondaryClaimableBalance: ({ multicall, rewarderContract, contractPosition, address }) =>
          multicall
            .prepare(rewarderContract)
            .pendingTokens(contractPosition.dataProps.poolIndex, address, 0)
            .then(v => v.rewardAmounts[0]),
      }),
    });
  }

```

Lastly, we will build response for these balances
<!--TODO explain further -->

```
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { AppsV3BalanceFetcher } from '~balance/fetchers/balance-fetcher.decorator';
import { BalanceFetcherV3, buildBalanceFetcherV3Response } from '~position/balance-fetcher.utils';
import { MasterChefContractPositionBalanceHelper } from '~position/helpers/master-chef.contract-position-balance-helper';
import { MasterChefDefaultStakedBalanceStrategy } from '~position/helpers/master-chef.default.staked-token-balance-strategy';
import { MasterChefRewarderClaimableBalanceStrategy } from '~position/helpers/master-chef.rewarder.claimable-token-balances-strategy';
import { TokenBalanceHelper } from '~position/helpers/token-balance.helper';

import { PickleContractFactory, PickleMiniChefV2, PickleRewarder } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

@AppsV3BalanceFetcher(PICKLE_DEFINITION.id, Network.POLYGON_MAINNET)
export class PolygonPickleBalanceFetcher implements BalanceFetcherV3 {
  constructor(
    @Inject(TokenBalanceHelper) private readonly tokenBalanceHelper: TokenBalanceHelper,
    @Inject(MasterChefContractPositionBalanceHelper)
    private readonly masterChefFarmContractPositionBalanceHelper: MasterChefContractPositionBalanceHelper,
    @Inject(MasterChefDefaultStakedBalanceStrategy)
    private readonly masterChefFarmContractPositionDefaultStakedBalanceStrategy: MasterChefDefaultStakedBalanceStrategy,
    @Inject(MasterChefRewarderClaimableBalanceStrategy)
    private readonly masterChefRewarderClaimableBalanceStrategy: MasterChefRewarderClaimableBalanceStrategy,
    @Inject(PickleContractFactory) private readonly contractFactory: PickleContractFactory,
  ) {}

  private async getJarBalances(address: string) {
    return await this.tokenBalanceHelper.getTokenBalances({
      network: Network.POLYGON_MAINNET,
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.jar,
      address,
    });
  }

  private async getFarmBalances(address: string) {
    const network = Network.POLYGON_MAINNET;

    return this.masterChefFarmContractPositionBalanceHelper.getBalances<PickleMiniChefV2>({
      address,
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.masterchefV2Farm,
      network,
      resolveChefContract: ({ contractAddress, network }) =>
        this.contractFactory.pickleMiniChefV2({ network, address: contractAddress }),
      resolveStakedTokenBalance: this.masterChefFarmContractPositionDefaultStakedBalanceStrategy.build({
        resolveStakedBalance: ({ contract, multicall, contractPosition }) =>
          multicall
            .prepare(contract)
            .userInfo(contractPosition.dataProps.poolIndex, address)
            .then(v => v.amount),
      }),
      resolveClaimableTokenBalances: this.masterChefRewarderClaimableBalanceStrategy.build<
        PickleMiniChefV2,
        PickleRewarder
      >({
        resolvePrimaryClaimableBalance: ({ multicall, contract, contractPosition, address }) =>
          multicall.prepare(contract).pendingPickle(contractPosition.dataProps.poolIndex, address),
        resolveRewarderAddress: ({ contract, contractPosition, multicall }) =>
          multicall.prepare(contract).rewarder(contractPosition.dataProps.poolIndex),
        resolveRewarderContract: ({ network, rewarderAddress }) =>
          this.contractFactory.pickleRewarder({ address: rewarderAddress, network }),
        resolveSecondaryClaimableBalance: ({ multicall, rewarderContract, contractPosition, address }) =>
          multicall
            .prepare(rewarderContract)
            .pendingTokens(contractPosition.dataProps.poolIndex, address, 0)
            .then(v => v.rewardAmounts[0]),
      }),
    });
  }

  async getBalances(address: string) {
    const [farmBalances, jarBalances] = await Promise.all([
      this.getFarmBalances(address),
      this.getJarBalances(address),
    ]);

    return buildBalanceFetcherV3Response([
      {
        label: 'Farms',
        assets: farmBalances,
      },
      {
        label: 'Jars',
        assets: jarBalances,
      },
    ]);
  }
}
```
Viola! We have officially set up all the fetchers that are neeeded to get our app's investments and balances in Zapper.

Now, all we need to do is write the module file and submit the PR!