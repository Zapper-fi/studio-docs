---
sidebar_position: 7
---

# Create a TVL fetcher

## What is TVL?

**TVL** stands for _total value locked_. It is the total amount of staked cryptocurrency within a protocol that is actively earning interest, being used as collateral, and so on. Let's take a look at a few examples:

- The TVL in **Uniswap V2** is the total amount of trading liquidity across all of its liquidity pools
- The TVL in **Aave V2** is the total amount of supplied collateral across the Aave V2 market
- The TVL in **Lido** on **Ethereum** is the total amount of ETH in their liquid staking (stETH)

## What is a TVL fetcher?

If you've been through the previous sections, you might already have a good idea about what this might be.

In the Zapper API, a `TVLFetcher` class is an adapter that retrieves the TVL of an app on a single network. Considering that applications have different contracts and implementations, the fetcher is abstract so that the developer can choose the appropriate strategy to retreive this TVL.

If you're implementing a `TVLFetcher` in Zapper, you might have good success looking at implementations in the impressive library built out by the [DefiLlama Team](https://github.com/DefiLlama/DefiLlama-Adapters). 

## Implement the TVL fetcher

Let's create a new file in `src/apps/pickle/ethereum/pickle.tvl-fetcher.ts`, and let's populate it with some boilerplate:

```ts
import { Inject } from '@nestjs/common';

import { Register } from '~app-toolkit/decorators';
import { APP_TOOLKIT, IAppToolkit } from '~lib';
import { TvlFetcher } from '~stats/tvl/tvl-fetcher.interface';
import { Network } from '~types/network.interface';

import PICKLE_DEFINITION from '../pickle.definition';

const appId = PICKLE_DEFINITION.id;
const network = Network.ETHEREUM_MAINNET;

@Register.TvlFetcher({ appId, network })
export class EthereumPickleTvlFetcher implements TvlFetcher {
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) {}

  async getTvl() {
    return 0;
  }
}
```

If you add this class as a provider to your `AppModule` in `src/apps/pickle/pickle.module.ts`, you'll be able to retrieve the TVL by visiting `http://localhost:5001/apps/pickle/tvl`.

However, since we previously calculated the TVL as a data property for each jar token in a previous section of this tutorial, we can simply retrieve all vault tokens, and sum the TVL!

```ts
// ...

@Register.TvlFetcher({ appId, network })
export class EthereumPickleTvlFetcher implements TvlFetcher {
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) {}

  async getTvl() {
    const tokens = await this.appToolkit.getAppTokenPositions<PickleJarTokenDataProps>({
      appId,
      groupIds: [PICKLE_DEFINITION.groups.jar.id],
      network,
    });

    return sumBy(tokens, v => v.dataProps.tvl);
  }
}
```

We're done! Hit the TVL endpoint again and you'll see the TVL of Pickle on the Ethereum network. We're ready to submit our code to the reviewers, and get your application integration merged to Zapper! ⚡