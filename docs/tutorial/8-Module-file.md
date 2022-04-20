---
sidebar_position: 8
---
# Module.ts - xxx
<!--TODO better title-->

Now that we have written our fetchers, we just need to register the modules with the application in our module.ts file. This is the final step to writing an integration.

This file is mostly static, with the purpose being to declare what is in this module.

In the main folder, create a new file named pickle.module.ts
<!-- TODO explain naiming convention-->

First, we'll import all relevant modules we've defined thus far, for each network and group. We only wrote the fetchers for Polygon, so only those are included here, but remember to include all modules from all networks in this file.

<!--TODO better explain above and what we are doing -->
<!--NOTE I removed pickle modules for Arbitrum and Ethereum, as we are not writing for those networks-->
```ts
import { Module } from '@nestjs/common';

import { CurveAppModule } from '~apps-v3/curve/curve.module';
import { SynthetixAppModule } from '~apps-v3/synthetix/synthetix.module';
import { YearnAppModule } from '~apps-v3/yearn/yearn.module';
import { MulticallModule } from '~multicall/multicall.module';
import { PositionModule } from '~position/position.module';
import { PricesModule } from '~prices/prices.module';
import { Web3Module } from '~web3/web3.module';

import { PickleContractFactory } from './contracts';
import { PickleApiJarRegistry } from './helpers/pickle.api.jar-registry';
import { PickleOnChainJarRegistry } from './helpers/pickle.on-chain.jar-registry';
import { PickleAppDefinition } from './pickle.definition';
import { PolygonPickleFarmContractPositionFetcher } from './polygon/pickle.farm.contract-position-fetcher';
import { PolygonPickleJarTokenFetcher } from './polygon/pickle.jar.token-fetcher';
import { PolygonPickleBalanceFetcher } from './polygon/pickle.balance-fetcher';
```

Next, we'll register these modules with our application

```ts
import { Module } from '@nestjs/common';

import { CurveAppModule } from '~apps-v3/curve/curve.module';
import { SynthetixAppModule } from '~apps-v3/synthetix/synthetix.module';
import { YearnAppModule } from '~apps-v3/yearn/yearn.module';
import { MulticallModule } from '~multicall/multicall.module';
import { PositionModule } from '~position/position.module';
import { PricesModule } from '~prices/prices.module';
import { Web3Module } from '~web3/web3.module';

import { PickleContractFactory } from './contracts';
import { PickleApiJarRegistry } from './helpers/pickle.api.jar-registry';
import { PickleOnChainJarRegistry } from './helpers/pickle.on-chain.jar-registry';
import { PickleAppDefinition } from './pickle.definition';
import { PolygonPickleFarmContractPositionFetcher } from './polygon/pickle.farm.contract-position-fetcher';
import { PolygonPickleJarTokenFetcher } from './polygon/pickle.jar.token-fetcher';
import { PolygonPickleBalanceFetcher } from './polygon/pickle.balance-fetcher';

@Module({
  imports: [
    Web3Module,
    PricesModule,
    PositionModule,
    MulticallModule,
    SynthetixAppModule,
    YearnAppModule,
    CurveAppModule,
  ],
  providers: [
    PickleAppDefinition,
    PickleApiJarRegistry,
    PickleOnChainJarRegistry,
    PickleContractFactory,
    // Polygon
    PolygonPickleJarTokenFetcher,
    PolygonPickleFarmContractPositionFetcher,
    PolygonPickleBalanceFetcher,
  ],
})
export class PickleAppModule {}
```

And we're done! Now all we need to do is submit the pull request for review by the Zapper team.