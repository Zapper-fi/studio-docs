---
sidebar_position: 4
---

# Token Fetcher

## What is a token?

As mentioned in the previous section, **Tokens** are investment positions that are represented by a token standard like `ERC20`. These are transferrable and fungible positions that maybe considered as a _receipt_ for an investment transaction. These _receipts_ may be used to represent:

- Liquidity pool positions in a decentralized exchange like **Uniswap**, **SushiSwap**, or **Curve**
- Autocompounding "vaults" like in a yield aggregator like **Pickle** or **Yearn**
- Supply and borrow positions in a lending app like **Aave**
- Or even more obscure primitives like options in **Opyn** or prize savings accounts in **PoolTogether**

## What is a token fetcher?

In the Zapper API, a `TokenFetcher` class dynamically lists a single group of `AppToken` typed objects. Groups of tokens share common properties, such as APYs for **Pickle** vault tokens, or fees for **Uniswap** pool tokens. As such, we declare unique strategy classes for each token group that we want to index in Zapper.

## What are the properties of a token?

The following table describes the properties on the `AppToken` object.

| Property        | Example                                        | Description                                                                                                                                        |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `ContractType.APP_TOKEN`                       | Used to [discriminate types](https://css-tricks.com/typescript-discriminated-unions/), do not change.                                              |
| `address`       | `'0x028171bca77440897b824ca71d1c56cac55b68a3'` | Address of the token                                                                                                                               |
| `network`       | `Network.ETHEREUM`                             | Network of the token                                                                                                                               |
| `key`           | `'ethereum:0x028171bca77440897b824ca71d1c56cac55b68a3'` | Optional. A unique key that represents this token, used for aggregation purposes in Zapper. The default value for a token would be `<network>:<address>`. An example of when this is needed would be for an ERC1155 token, which supports multiple tokens on a single address.
| `appId`         | `'aave-v2'`                                    | The token belongs to this app                                                                                                                      |
| `groupId`       | `'supply'`                                     | The token belongs to this group of the given app                                                                                                   |
| `symbol`        | `'aDAI'`                                       | The ERC20 symbol of this token                                                                                                                     |
| `decimals`      | `18`                                           | The ERC20 decimals of this token                                                                                                                   |
| `supply`        | `438584072.834534305205134424`                 | The display value of the ERC20 supply of this token                                                                                                |
| `tokens`        | `[daiToken]`                                   | The underlying token(s). For example, to mint `aDAI` tokens, you need to supply `DAI` tokens.                                                      |
| `price`         | `1`                                            | The price of one unit of this token. In the case of `aDAI`, the tokens are minted 1:1, so the price is the same as the underlying `DAI` token.     |
| `pricePerShare` | `1`                                            | The _ratio_ between the price of the token and the price of the underlying token. Since `aDAI` and `DAI` are minted 1:1, the `pricePerShare` is 1. |
