---
sidebar_position: 2
---

# Create a definitions.ts file

In the folder you just created, create a definitions file, defining what modules are needed, along with meta data about your app

Create a markdown file named `definitions.ts` in this folder.

For this walkthrough, lets use Pickle Finance as an example app to write the integration for. Pickle is great, as they have a variety of investment types, such as Jars (vaults) and farms for staking. <!--TODO confirm Pickle finance rationale -->


First thing we'll do in this file is define what modules are needed xxxxxxxx  <!--TODO explain modules-->


```definitions.ts"
import { ProtocolTag, ProtocolAction } from '@zapper-fi/types/balances';
import { Network } from '@zapper-fi/types/networks';

import { RegisterAppV3Definition } from '~apps-v3/apps-definition.decorator';
import { AppDefinition } from '~apps/app-definition.interface';
```

Next we will define metadata about our App. Chose a unique id for your app, input a description, URL, and other relevant information. All relevant information we support:
- Short app description
- Website URL
- Discord
- Twitter
- Subreddit
- Telegram
- Github
- DAO voting

<!--We need to support the above metadata -->
```
import { ProtocolTag, ProtocolAction } from '@zapper-fi/types/balances';
import { Network } from '@zapper-fi/types/networks';

import { RegisterAppV3Definition } from '~apps-v3/apps-definition.decorator';
import { AppDefinition } from '~apps/app-definition.interface';

export const PICKLE_DEFINITION = {
  id: 'pickle',
  name: 'Pickle',
  description: `Pickle Finance helps users to maximize their DeFi yields by auto-compounding their rewards, saving them time and gas.`,
  url: 'https://pickle.finance/',
  discord: 
  twitter: https://twitter.com/picklefinance 
  reddit: 
  telegram:
  github:
  dao-voting-link:
}
```
Next, we'll define the groups of investments our app supports, some more meta data around tags and color to use for the app's page on Zapper, and what networks our app operates on.

Pickle Finance supports vaults, single-staking farms, and masterchef farms. We'll focus just on the vaults (jars) and masterchef-v2 farms. Pickle also operates across multiple chains, but we we fill focus on just Ethereum for now.
<!--TODO what is "tags" and "token", on the th mainnet?-->

```
import { ProtocolTag, ProtocolAction } from '@zapper-fi/types/balances';
import { Network } from '@zapper-fi/types/networks';

import { RegisterAppV3Definition } from '~apps-v3/apps-definition.decorator';
import { AppDefinition } from '~apps/app-definition.interface';

export const PICKLE_DEFINITION = {
  id: 'pickle',
  name: 'Pickle',
  description: `Pickle Finance helps users to maximize their DeFi yields by auto-compounding their rewards, saving them time and gas.`,
  url: 'https://pickle.finance/',
  discord: 
  twitter: https://twitter.com/picklefinance 
  reddit: 
  telegram:
  github:
  dao-voting-link:

  groups: {
    jar: 'jar',
    masterchefV2Farm: 'masterchef-v2-farm',
  },
  primaryColor: '#1b8d54',
  tags: [ProtocolTag.YIELD_AGGREGATOR], <!--TODO what is this-->
  supportedNetworks: {
    [Network.POLYGON_MAINNET]: [ProtocolAction.VIEW],
  },
  token: {
    address: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5',
    network: Network.ETHEREUM_MAINNET,
  },
};
```

Last, we will add register our app definition with Zapper 
<!--TODO confirm this is the correct way to explain the below code-->

```
import { ProtocolTag, ProtocolAction } from '@zapper-fi/types/balances';
import { Network } from '@zapper-fi/types/networks';

import { RegisterAppV3Definition } from '~apps-v3/apps-definition.decorator';
import { AppDefinition } from '~apps/app-definition.interface';

export const PICKLE_DEFINITION = {
  id: 'pickle',
  name: 'Pickle',
  description: `Pickle Finance helps users to maximize their DeFi yields by auto-compounding their rewards, saving them time and gas.`,
  url: 'https://pickle.finance/',
  discord: 
  twitter: https://twitter.com/picklefinance 
  reddit: 
  telegram:
  github:
  dao-voting-link:

    groups: {
    jar: 'jar',
    masterchefV2Farm: 'masterchef-v2-farm',
  },
  primaryColor: '#1b8d54',
  tags: [ProtocolTag.YIELD_AGGREGATOR], <!--what is this-->
  supportedNetworks: {
    [Network.POLYGON_MAINNET]: [ProtocolAction.VIEW],
  },
  token: {
    address: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5',
    network: Network.ETHEREUM_MAINNET,
  },
};
@RegisterAppV3Definition(PICKLE_DEFINITION.id)
export class PickleAppDefinition extends AppDefinition {
  constructor() {
    super(PICKLE_DEFINITION);
  }
}
```
Viola! Our definition file is now complete.