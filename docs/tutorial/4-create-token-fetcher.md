---
sidebar_position: 4
---

# Create a token fetcher

In the Zapper API, a `TokenFetcher` class dynamically lists a single group of
`AppToken` typed objects. You can see more information
[here](../concepts/app-tokens.md).

## Generate a token fetcher

Our codegen utilities will automatically generate the boilerplate for a token
fetcher. Run `pnpm studio create-token-fetcher pickle`. When prompted for the
group, select `jar`, and when prompted for the network, select `ethereum`.

![Create Token Fetcher](../../static/img/tutorial/create-token-fetcher.png)

## Implement the token fetcher

Let's open `src/apps/pickle/ethereum/pickle.jar.token-fetcher.ts`. The skeleton
has been assembled for you, and you'll now need to fill in the contents of the
`getPositions` method in the `EthereumPickleJarTokenFetcher`.

```ts
import { Inject } from "@nestjs/common";

import { APP_TOOLKIT } from "~app-toolkit/app-toolkit.interface";
import { PositionTemplate } from "~app-toolkit/decorators/position-template.decorator";
import { Erc20 } from "~contract/contracts";
import { AppTokenTemplatePositionFetcher } from "~position/template/app-token.template.position-fetcher";
import {
  GetAddressesParams,
  DefaultAppTokenDefinition,
  GetUnderlyingTokensParams,
  UnderlyingTokenDefinition,
  DefaultAppTokenDataProps,
  GetPricePerShareParams,
} from "~position/template/app-token.template.types";

import { PickleContractFactory } from "../contracts";

@PositionTemplate()
export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<Erc20> {
  groupLabel: string;

  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(PickleContractFactory)
    protected readonly contractFactory: PickleContractFactory
  ) {
    super(appToolkit);
  }

  getContract(address: string): Erc20 {
    throw new Error("Method not implemented.");
  }

  getAddresses(
    params: GetAddressesParams<DefaultAppTokenDefinition>
  ): string[] | Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  getUnderlyingTokenDefinitions(
    _params: GetUnderlyingTokensParams<Erc20, DefaultAppTokenDefinition>
  ): Promise<UnderlyingTokenDefinition[]> {
    throw new Error("Method not implemented.");
  }

  getPricePerShare(
    _params: GetPricePerShareParams<
      Erc20,
      DefaultAppTokenDataProps,
      DefaultAppTokenDefinition
    >
  ): Promise<number | number[]> {
    throw new Error("Method not implemented.");
  }
}
```

Firstly, notice that the class extends `AppTokenTemplatePositionFetcher`, which
provides default functionality for most of the properties described in
[here](../concepts/app-tokens.md). You're job is to correctly implement the
scaffolded abstract properties and methods (and possibly override some default
functionality from the parent class as well)

Secondly, we'll note that our class is decorated with `@PositionTemplate()`.
This decorator populates the `appId`, `groupId`, and `network` properties at
runtime from the a conventional filepath structure as follows:
`src/apps/<app_id>/<network>/<app_id>.<group_id>.token-fetcher.ts`.

Lastly, we'll see that the `AppToolkit` and `PickleContractFactory` have already
been injected into the scope of your class. What are these? The `AppToolkit`
provides an SDK of utilities to interact with the blockchain, retrieve base
token prices, or even retrieve tokens and positions from other apps defined in
Zapper. The `PickleContractFactory`, as explained in the previous section,
builds typed instances of the contract ABIs you have in your
`src/pickle/contracts/abis` directory.

Let's get to work!

## Implement `getContract`

From the previous section, you should have already generated the contract
factory boilerplate code to create an instance of the `PickleJar` typed Ethers
contract instance.

We know that all Pickle Jar tokens implement this interface, so we'll replace
`Erc20` in the `AppTokenTemplatePositionFetcher` generic with `PickleJar`.

```ts
import { PickleContractFactory, PickleJar } from "../contracts";

export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  // ...
}
```

Next, we'll implement `getContract` by calling the appropriate factory method on
our injected contract factory. Note that `address` represents the address of one
of the Pickle Jar tokens.

```ts
export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  //...

  getContract(address: string): PickleJar {
    return this.contractFactory.pickleJar({ address, network: this.network });
  }

  //...
}
```

## Implement `getAddresses`

Pickle provides an
[API endpoint](https://api.pickle.finance/prod/protocol/pools) that lists out
all of the jar tokens across all supported networks on the Pickle application.

We'll make use of this endpoint to list out all of our tokens.

```ts
// Define a partial of the return type from the Pickle API
export type PickleVaultDetails = {
  jarAddress: string;
  network: string;
  apy: number;
};

export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  //...

  async getAddresses() {
    // Retrieve pool addresses from the Pickle API
    const endpoint = "https://api.pickle.finance/prod/protocol/pools";
    const response = await axios.get<PickleVaultDetails[]>(endpoint);
    const ethData = response.data.filter(({ network }) => network === "eth");
    const jarAddresses = ethData.map(({ jarAddress }) => jarAddress);
    return jarAddresses;
  }

  //...
}
```

## Implement `getUnderlyingTokenDefinitions`

In Web3, composability is king. Tokens wrap other tokens with functionality that
provides value to the owner. You may have heard the term **DeFi Legos** for this
reason.

In the case of **Pickle Finance**, a user deposits a token, and receives a vault
token that represents an auto-compounding balance of the deposited token. The
yield is aggregated from some underlying strategy and returned to the user.

Our `AppTokenPosition` object represents this relationship using the `tokens`
and `pricePerShare` properties. The `tokens` property is an array of the
underlying tokens of the wrapper token, and the `pricePerShare` property
represents the ratio between the balance of the app token and the balance of the
underlying token.

For example, if a user deposits 1100 `LOOKS` tokens into a Pickle vault that has
a `pricePerShare` of `1.1`, the user receives 1000 `pLOOKS` tokens as a receipt.
Conversely, on withdrawal, they would receive 1100 `LOOKS` tokens for burning
their 1000 `pLOOKS` tokens.

Let's see how to retrieve this data for a Pickle jar token:

```ts
export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  //...

  async getUnderlyingTokenDefinitions() {
    return [{ address: await contract.token(), network: this.network }];
  }

  //...
}
```

## Implement `getPricePerShare`

...and to continue from the previous section, let's implement the
`getPricePerShare` method to retrieve the ratio between the app token and the
underlying tokens.

```ts
export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  // ...

  async getPricePerShare({
    contract,
  }: GetPricePerShareParams<PickleJar, DefaultDataProps>) {
    return contract.getRatio().then((v) => Number(v) / 10 ** 18);
  }

  // ...
}
```

## (Optional) Implement `getLabel`

> What do you mean `bSupercrvRenWBTC` isn't a user-friendly name?

Using the `symbol` as a token label is generally not a great solution for human
readability. Instead, we define `displayProps` on each token that instructs how
Zapper will render the token in our web and mobile applications. The developer
is in full control to define a `label`, `secondaryLabel`, and optional
`tertiaryLabel`, and `images`.

We can override the `getLabel` method to replace the default functionality,
which is to show the `symbol` of the token. Instead, we'll show the string
`<underlying_token_label> Jar`, like `LOOKS Jar` or `WETH / PICKLE Jar`.

```ts
export class EthereumPickleJarTokenFetcher extends AppTokenTemplatePositionFetcher<PickleJar> {
  // ...

  async getLabel({
    appToken,
  }: GetDisplayPropsParams<PickleJar, DefaultDataProps>) {
    return `${getLabelFromToken(appToken.tokens[0])} Jar`;
  }

  // ...
}
```

## Run the application

We can now run our **Pickle** application integration and start manually testing
some of our data. We also do _not_ want to run all of the other apps defined in
Studio. Create a `.env` file at the root, and update it as follows:

```dosini
ENABLED_APPS=pickle
```

Now, we can run the Studio development server in the terminal with `pnpm dev`.
If it started successfully, you can now open
`http://localhost:5001/apps/pickle/tokens?groupIds[]=jar&network=ethereum` in
your browser. Admire your completed work of art! Hooray 🎉!

This implementation works well, but it is a little naive. We have common
template classes to simplify building vault tokens. Abstract templates make
implementations easier and more consistent. You can see how a template class
could be used for a vault in [Recipes](../recipes/intro.md).

In the next section, we'll look into enumerating **farms** in the same way, with
the difference being that farm positions are not tokenized.
