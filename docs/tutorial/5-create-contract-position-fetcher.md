---
sidebar_position: 5
---

# Create a contract position fetcher

## What is a contract position?

As mentioned in the previous section, **Contract Positions** are investment positions that are _not_ represented by a token standard. It is often these positions that are more difficult to track by simple wallet applications, and this is especially where Zapper shines at decoding these positions from blockchain data. These positions may be used to represent:

- Farming positions in **SushiSwap** Master Chef staking contracts
- Bonds in **Olympus** or other apps that aim to own their liquidity
- Leveraged positions in isolated markets like **Abracadabra** cauldrons or **Alchemix** alchemists
- Claimable airdrops across the Web3 ecosystem!

As a little rule of thumb, you likely won't be able to manually add these positions to your Metamask wallet because they are _not_ tokenized! For example, once you deposit a token into a SushiSwap Master Chef farm, your wallet will likely not be able to display this position.

## What is a contract position fetcher?

In the Zapper API, a `ContractPositionFetcher` class dynamically lists a single group of contract positions. Groups of contract positions share common properties, such as APYs for **SushiSwap** farms, or collateralization limits for **Alchemix** alchemists. As such, we declare unique strategy classes for each contract position group that we want to index in Zapper.

## Implement the contract position fetcher

In the previous section, we already generated the boilerplate having correctly configured the `groups` in our app definition file.

Let's open `src/apps/pickle/ethereum/pickle.farm.contract-position-fetcher.ts`. The skeleton has been assembled for you, and you'll now need to fill in the contents of the `getPositions` method in the `EthereumPickleFarmContractPositionFetcher`.

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { PickleContractFactory } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

const appId = PICKLE_DEFINITION.id;
const groupId = PICKLE_DEFINITION.groups.farm.id;
const network = Network.ETHEREUM_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(PickleContractFactory) private readonly pickleContractFactory: PickleContractFactory,
  ) {}

  async getPositions() {
    return [];
  }
}
```

You might notice that it is almost identical to the boilerplate of the `TokenFetcher` class that we implemented in the previous section of this tutorial. In fact, it simply needs to return a list of `ContractPosition` rather than a list of `AppTokenPosition`.

Let's get to work!

## Resolve all farm addresses from the Pickle API

In the last section, we used an [API endpoint](https://api.pickle.finance/prod/protocol/pools) from **Pickle Finance** to list out all the jar addresses for all supported networks on Pickle. This endpoint also includes the associated farm address for each vault token.

Before we continue, what is a _farm_? A **farm** is a smart contract in which a user can _stake_ their token in return for rewards over time. It incentivizes the user to maintain their position in return for rewards. In the case of Pickle, the user would receive **PICKLE** token rewards for staking their jar tokens.

Let's see how we would build a farm contract position fetcher!

```ts
// ...

// Define a partial of the return type from the Pickle API
export type PickleVaultDetails = {
  jarAddress: string;
  gaugeAddress: string;
  network: string;
};

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(PickleContractFactory) private readonly pickleContractFactory: PickleContractFactory,
  ) {}

  async getPositions() {
    // Retrieve pool addresses from the Pickle API
    const endpoint = 'https://api.pickle.finance/prod/protocol/pools';
    const data = await Axios.get<PickleVaultDetails[]>(endpoint).then(v => v.data);
    const ethData = data.filter(({ network }) => network === 'eth');
    const farmDefinitions = ethData
      .filter(({ gaugeAddress }) => !!gaugeAddress)
      .map(({ jarAddress, gaugeAddress }) => ({
        address: gaugeAddress.toLowerCase(),
        stakedTokenAddress: jarAddress.toLowerCase(),
        rewardTokenAddress: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5', // PICKLE
      }));
    
    // Return _anything_ so we can see a result right now!
    return farmDefinitions as any;
  }
}
```

Easy enough. Open `http://localhost:5001/apps/pickle/positions?groupIds[]=farm&network=ethereum` and admire your work!

## Resolve the staked and claimable tokens

Our farm definitions have the staked token addresses and reward token addresses. Let's resolve these to the actual underlying `Token` objects, and augment them with **metatype** to indicate which token is `supplied` and which token is `claimable`.

```ts
// ...

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  // ...

  async getPositions() {
    // ...

    // The reward token is PICKLE, which is a base token
    const baseTokens = await this.appToolkit.getBaseTokenPrices(network);

    // ...and the staked tokens are Pickle Jar tokens, so resolve these app tokens
    const appTokens = await this.appToolkit.getAppTokenPositions(
      { appId: 'pickle', groupIds: ['jar'], network },
    );

    // ...combine these together as our index for finding token dependencies
    const allTokens = [...appTokens, ...baseTokens]
    
    // We will build a token object for each jar address, using data retrieved on-chain with Ethers
    const positions = await Promise.all(
      farmDefinitions.map(async ({ address, stakedTokenAddress, rewardTokenAddress }) => {
        const stakedToken = allTokens.find(v => v.address === stakedTokenAddress);
        const rewardToken = allTokens.find(v => v.address === rewardTokenAddress);
        if (!stakedToken || !rewardToken) return null;

        const tokens = [supplied(stakedToken), claimable(rewardToken)];

        // Create the contract position object
        const position: ContractPosition = {
          type: ContractType.POSITION,
          appId,
          groupId,
          address,
          network,
          tokens,
        };

        return token;
      }),
    );

    return _.compact(positions);
  }
}
```

## Resolve any additional data properties

(This is an optional step and can be skipped!)

As mentioned previously, groups of contract positions share common strategies on how to retrieve and build their properties, and may also share common additional properties. We can define additional properties in the `dataProps` field of the `ContractPosition` type.

We'll also make the use of generics to properly type our `dataProps`. The rest of our application can use these types when referencing the **Pickle** farm contract positions.

Let's return the total value locked in this farm response as part of the `dataProps`.

```ts
// ...

// Declare the data properties for a Pickle jar token
export type PickleFarmContractPositionDataProps = {
  totalValueLocked: number;
}

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(PickleContractFactory) private readonly pickleContractFactory: PickleContractFactory,
  ) {}

  async getPositions() {
    // ...

    // Create a multicall wrapper instance to batch chain RPC calls together
    const multicall = this.appToolkit.getMulticall(network);

    const positions = await Promise.all(
      farmDefinitions.map(async ({ address, stakedTokenAddress, rewardTokenAddress }) => {
        // ...

        // Instantiate a smart contract instance pointing to the jar token address
        const contract = this.pickleContractFactory.pickleJar({ address: stakedToken.address, network });
        
        // Request the jar token balance of this farm
        const [balanceRaw] = await Promise.all([
          multicall.wrap(contract).balanceOf(address),
        ]);

        // Denormalize the balance as the TVL
        const totalValueLocked = Number(balanceRaw) / 10 ** stakedToken.decimals;

        // Create the token object
        const token: ContractPosition<PickleFarmContractPositionDataProps> = {
          // ...
          dataProps: {
            totalValueLocked,
          }
        };

        return token;
      }),
    );

    return _.compact(positions);
  }
}
```

We're almost there! Now we just need to tell Zapper how to render this contract position in our application.

## Resolve display properties

Lastly, we'll want to resolve a meaningful label for this position. Like stated in the previous section for the `TokenFetcher` class, these labels are used to optimize human readability of this investment.

Let's put everything together and observe our finished product!

```ts
import { Inject } from '@nestjs/common';
import Axios from 'axios';
import { compact } from 'lodash';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { buildDollarDisplayItem } from '~app-toolkit/helpers/presentation/display-item.present';
import { getImagesFromToken, getLabelFromToken } from '~app-toolkit/helpers/presentation/image.present';
import { ContractType } from '~position/contract.interface';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { claimable, supplied } from '~position/position.utils';
import { Network } from '~types/network.interface';

import { PickleContractFactory } from '../contracts';
import { PICKLE_DEFINITION } from '../pickle.definition';

const appId = PICKLE_DEFINITION.id;
const groupId = PICKLE_DEFINITION.groups.farm.id;
const network = Network.ETHEREUM_MAINNET;

export type PickleVaultDetails = {
  jarAddress: string;
  gaugeAddress: string;
  network: string;
};

export type PickleFarmContractPositionDataProps = {
  totalValueLocked: number;
};

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumPickleFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(PickleContractFactory) private readonly pickleContractFactory: PickleContractFactory,
  ) {}

  async getPositions() {
    const endpoint = 'https://api.pickle.finance/prod/protocol/pools';
    const data = await Axios.get<PickleVaultDetails[]>(endpoint).then(v => v.data);
    const ethData = data.filter(({ network }) => network === 'eth');
    const farmDefinitions = ethData
      .filter(({ gaugeAddress }) => !!gaugeAddress)
      .map(({ jarAddress, gaugeAddress }) => ({
        address: gaugeAddress.toLowerCase(),
        stakedTokenAddress: jarAddress.toLowerCase(),
        rewardTokenAddress: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5', // PICKLE
      }));

    const baseTokens = await this.appToolkit.getBaseTokenPrices(network);
    const appTokens = await this.appToolkit.getAppTokenPositions({ appId: 'pickle', groupIds: ['jar'], network });
    const allTokens = [...appTokens, ...baseTokens];
    const multicall = this.appToolkit.getMulticall(network);

    const tokens = await Promise.all(
      farmDefinitions.map(async ({ address, stakedTokenAddress, rewardTokenAddress }) => {
        const stakedToken = allTokens.find(v => v.address === stakedTokenAddress);
        const rewardToken = allTokens.find(v => v.address === rewardTokenAddress);
        if (!stakedToken || !rewardToken) return null;

        const tokens = [supplied(stakedToken), claimable(rewardToken)];
        const contract = this.pickleContractFactory.pickleJar({ address: stakedToken.address, network });
        const [balanceRaw] = await Promise.all([multicall.wrap(contract).balanceOf(address)]);
        const totalValueLocked = Number(balanceRaw) / 10 ** stakedToken.decimals;

        // As a label, we'll use the underlying label, and prefix it with 'Staked'
        const label = `Staked ${getLabelFromToken(stakedToken)}`;
        // For images, we'll use the underlying token images as well
        const images = getImagesFromToken(stakedToken);
        // For the secondary label, we'll use the price of the jar token
        const secondaryLabel = buildDollarDisplayItem(stakedToken.price);

        // Create the contract position object
        const position: ContractPosition<PickleFarmContractPositionDataProps> = {
          type: ContractType.POSITION,
          appId,
          groupId,
          address,
          network,
          tokens,
          dataProps: {
            totalValueLocked,
          },
          displayProps: {
            label,
            secondaryLabel,
            images,
          },
        };

        return position;
      }),
    );

    return compact(tokens);
  }
}
```

Visit `http://localhost:5001/apps/pickle/positions?groupIds[]=farm&network=ethereum` again in your browser and you can admire your completed work. Here's an example of one of the positions in this list:

```json
[
  {
    "type":"contract-position",
    "appId":"pickle",
    "groupId":"farm",
    "address":"0xf5bd1a4894a6ac1d786c7820bc1f36b1535147f6",
    "network":"ethereum",
    "tokens":[
      {
        "metaType":"supplied",
        "type":"app-token",
        "appId":"pickle",
        "groupId":"jar",
        "address":"0x1bb74b5ddc1f4fc91d6f9e7906cf68bc93538e33",
        "network":"ethereum",
        "symbol":"p3Crv",
        "decimals":18,
        "supply":76114.08809389763,
        "tokens":[
          {
            "type":"app-token",
            "address":"0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
            "network":"ethereum",
            "appId":"curve",
            "groupId":"pool",
            "symbol":"3Crv",
            "decimals":18,
            "supply":3532681958.7655787,
            "price":1.019001101919686,
            "pricePerShare":[
              0.403263252552053,
              0.3780319150210071,
              0.23942714208122942
            ],
            "tokens":[
              {
                "type":"base-token",
                "network":"ethereum",
                "address":"0x6b175474e89094c44da98b954eedeac495271d0f",
                "decimals":18,
                "symbol":"DAI",
                "price":0.999004
              },
              {
                "type":"base-token",
                "network":"ethereum",
                "address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                "decimals":6,
                "symbol":"USDC",
                "price":0.998319
              },
              {
                "type":"base-token",
                "network":"ethereum",
                "address":"0xdac17f958d2ee523a2206206994597c13d831ec7",
                "decimals":6,
                "symbol":"USDT",
                "price":1
              }
            ],
            "dataProps":{
              "swapAddress":"0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
              "liquidity":3602223466.5813246,
              "volume":9977330.093130862,
              "fee":0.0003
            },
            "displayProps":{
              "label":"3Pool Curve",
              "secondaryLabel":"39% / 37% / 23%",
              "images":[
                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png",
                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
              ],
              "statsItems":[
                {
                  "label":"Liquidity",
                  "value":{
                    "type":"dollar",
                    "value":3602223466.5813246
                  }
                },
                {
                  "label":"Supply",
                  "value":{
                    "type":"number",
                    "value":3532681958.7655787
                  }
                },
                {
                  "label":"Volume",
                  "value":{
                    "type":"dollar",
                    "value":9977330.093130862
                  }
                },
                {
                  "label":"Fee",
                  "value":{
                    "type":"pct",
                    "value":0.0003
                  }
                }
              ]
            }
          }
        ],
        "price":1.1362554816491606,
        "pricePerShare":1.1150679616622396,
        "dataProps":{
          "apy":0.07925704665611275
        },
        "displayProps":{
          "label":"3Pool Curve Jar",
          "images":[
            "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png",
            "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
            "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
          ],
          "secondaryLabel":{
            "type":"dollar",
            "value":1.1362554816491606
          },
          "tertiaryLabel":"7.926% APY"
        }
      },
      {
        "metaType":"claimable",
        "type":"base-token",
        "network":"ethereum",
        "address":"0x429881672b9ae42b8eba0e26cd9c73711b891ca5",
        "decimals":18,
        "symbol":"PICKLE",
        "price":4.91
      }
    ],
    "dataProps":{
      "totalValueLocked":38701.34643112021
    },
    "displayProps":{
      "label":"Staked 3Pool Curve Jar",
      "secondaryLabel":{
        "type":"dollar",
        "value":1.1362554816491606
      },
      "images":[
        "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png",
        "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
        "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
      ]
    }
  }
]
```

This implementation works well, but it is a little naive. We have helper classes to simplify building single staking farm positions. Helpers make implementations easier and more consistent. You can see how a helper could be used for a farm in [Recipes](../recipes/intro.md).

In the last two sections, we've built our _user-agnostic_ data for tokens and contract positions. In the next section, we'll use these sets of data to build _user-centric_ balance data for any given address.
