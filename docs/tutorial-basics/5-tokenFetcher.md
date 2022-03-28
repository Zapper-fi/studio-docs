---
sidebar_position: 5
---
# tokenFetcher - fetching tokenized positions

We broadly group defi investments a user has into 2 categories: tokenized positions and non-tokenized positions. 
- Tokenized positions are investments which are represented to the user by tokens that they hold in their wallet. Example would be staked AAVE (stkAAVE) or cTokens on Compound. These are easily transferrable, but there may not always be a market to buy and sell them
- Non-tokenized positions are investments the user has made that are not represented by a token in their wallet. Instead, the user's balance is logged on a smart contract registry. Example of this would be master chef contracts. These investemnts are generally not transferrable, as the user is not in possession of a token representing their investment

Your app may have both tokenized positions and non-tokenized positions that a user would want to see in their Zapper dashboard. Zapper has built out 2 fetchers to handle incorporating these balances into the dashboard-- tokenFetcher, for tokenized balances, and contractPositionFetcher, for non-tokenized balances.

First, lets start with fetching your token positions, using tokenFetcher.

For Pickle Finance, an example of a tokenized position is the Pickle Jars.

To import the jar tokens, we'll create a file named pickle.jar.token-fetcher.ts. <!--TODO explain naming convention -->

The first thing we'll do is import relevant packages for the tokenFetcher
<!--TODO explain packages -->
<!--TODO note that the helper was removed in tihs code snippet -->
``` 
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { CURVE_DEFINITION } from '~apps-v3/curve/curve.definition';
import { QUICKSWAP_DEFINITION } from '~apps-v3/quickswap/quickswap.definition';
import { SUSHISWAP_DEFINITION } from '~apps-v3/sushiswap/sushiswap.definition';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import { AppToken, ContractType, PositionFetcher } from '~position/position-fetcher.interface';
import { getLabelFromToken } from '~position/position-fetcher.utils';

import { PickleContractFactory, PickleJar } from '../contracts';
import { PickleOnChainJarRegistry } from '../helpers/pickle.on-chain.jar-registry';
import { PICKLE_DEFINITION } from '../pickle.definition';
```

Next, we will register the positionFetcher with our application
<!--explain what we are registering -->
``` 
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { CURVE_DEFINITION } from '~apps-v3/curve/curve.definition';
import { QUICKSWAP_DEFINITION } from '~apps-v3/quickswap/quickswap.definition';
import { SUSHISWAP_DEFINITION } from '~apps-v3/sushiswap/sushiswap.definition';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import { AppToken, ContractType, PositionFetcher } from '~position/position-fetcher.interface';
import { getLabelFromToken } from '~position/position-fetcher.utils';

import { PickleContractFactory, PickleJar } from '../contracts';
import { PickleOnChainJarRegistry } from '../helpers/pickle.on-chain.jar-registry';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.jar,
  network: Network.POLYGON_MAINNET,
  type: ContractType.APP_TOKEN,
})
```

Next, we will add in the export class <!--TODO explain this -->
``` 
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { CURVE_DEFINITION } from '~apps-v3/curve/curve.definition';
import { QUICKSWAP_DEFINITION } from '~apps-v3/quickswap/quickswap.definition';
import { SUSHISWAP_DEFINITION } from '~apps-v3/sushiswap/sushiswap.definition';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import { AppToken, ContractType, PositionFetcher } from '~position/position-fetcher.interface';
import { getLabelFromToken } from '~position/position-fetcher.utils';

import { PickleContractFactory, PickleJar } from '../contracts';
import { PickleOnChainJarRegistry } from '../helpers/pickle.on-chain.jar-registry';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.jar,
  network: Network.POLYGON_MAINNET,
  type: ContractType.APP_TOKEN,
})
export class PolygonPickleJarTokenFetcher implements PositionFetcher<AppToken> {
  constructor(
    @Inject(PickleContractFactory)
    private readonly pickleContractFactory: PickleContractFactory,
    @Inject(YearnLikeVaultTokenHelper)
    private readonly yearnVaultTokenHelper: YearnLikeVaultTokenHelper,
    @Inject(PickleOnChainJarRegistry) private readonly jarRegistry: PickleOnChainJarRegistry,
  ) {}
```

Lastly, we will define how the tokenFetcher should get positions, xxxx
``` 
import { Inject } from '@nestjs/common';
import { Network } from '@zapper-fi/types/networks';

import { CURVE_DEFINITION } from '~apps-v3/curve/curve.definition';
import { QUICKSWAP_DEFINITION } from '~apps-v3/quickswap/quickswap.definition';
import { SUSHISWAP_DEFINITION } from '~apps-v3/sushiswap/sushiswap.definition';
import { RegisterPositionFetcher } from '~position/position-fetcher.decorator';
import { AppToken, ContractType, PositionFetcher } from '~position/position-fetcher.interface';
import { getLabelFromToken } from '~position/position-fetcher.utils';

import { PickleContractFactory, PickleJar } from '../contracts';
import { PickleOnChainJarRegistry } from '../helpers/pickle.on-chain.jar-registry';
import { PICKLE_DEFINITION } from '../pickle.definition';

@RegisterPositionFetcher({
  appId: PICKLE_DEFINITION.id,
  groupId: PICKLE_DEFINITION.groups.jar,
  network: Network.POLYGON_MAINNET,
  type: ContractType.APP_TOKEN,
})

export class PolygonPickleJarTokenFetcher implements PositionFetcher<AppToken> {
  constructor(
    @Inject(PickleContractFactory)
    private readonly pickleContractFactory: PickleContractFactory,
    @Inject(YearnLikeVaultTokenHelper)
    private readonly yearnVaultTokenHelper: YearnLikeVaultTokenHelper,
    @Inject(PickleOnChainJarRegistry) private readonly jarRegistry: PickleOnChainJarRegistry,
  ) {}

  async getPositions() {
    const network = Network.POLYGON_MAINNET;
    const vaults = await this.jarRegistry.getJarDefinitions({ network });

    return this.yearnVaultTokenHelper.getTokens<PickleJar>({
      appId: PICKLE_DEFINITION.id,
      groupId: PICKLE_DEFINITION.groups.jar,
      network,
      dependencies: [
        { appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool], network },
        { appId: QUICKSWAP_DEFINITION.id, groupIds: [QUICKSWAP_DEFINITION.groups.pool], network },
        { appId: SUSHISWAP_DEFINITION.id, groupIds: [SUSHISWAP_DEFINITION.groups.pool], network },
      ],
      resolvePrimaryLabel: ({ underlyingToken }) => `${getLabelFromToken(underlyingToken)} Jar`,
      resolvePricePerShare: async ({ multicall, contract }) => multicall.prepare(contract).getRatio(),
      resolvePricePerShareActual: ({ pricePerShareRaw }) => Number(pricePerShareRaw) / 10 ** 18,
      resolveVaultAddresses: async () => vaults.map(({ vaultAddress }) => vaultAddress),
      resolveContract: ({ address, network }) => this.pickleContractFactory.pickleJar({ address, network }),
      resolveApy: async () => 0,
    });
  }
}
```

Now that we have imported our tokenized positions via tokenFetcher, lets now switch over and import our non-tokenized positions, using contractPositionFetcher.
