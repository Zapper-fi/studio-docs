---
sidebar_position: 1
---

# Getting Started

![](../../static/img/assets/zapper_api_logo.png)


The Zapper API provides some of the most robust DeFi related data, everything from liquidity and prices on different AMMs to complex DeFi app balances all in one convenient place. In addition, the API also supports bridging between different networks as well as formatted Zap transaction endpoints.

:::info
We ask that builders using the API include our **"Powered by Zapper"** logo with a backlink to [https://zapper.fi](https://zapper.fi) in their project. **"Powered by Zapper"**  brand asset can be downloaded [here](../docs/brand-assets.md).
:::

## Data Endpoints

The Zapper Developer APIs provides the community with accessible and consistent DeFi data for an ever increasing number of apps. 

For a full list of supported apps, [see here](https://zapper.fi/protocols). 

To see all endpoints that are available for public use, Check out the [Swagger UI](https://api.zapper.fi/api/static/index.html#) to see how to query wallet balances, token prices, gas prices, and more.

![](../../static/img/assets/data_api.png)

## Transactional Endpoints

The Zapper API Transaction endpoints makes it easy for builders to interact directly with a wide range of DeFi apps. Get an easy to consume transaction for approving, adding, removing, and rebalancing liquidity through any of [our zap contracts](../apis/3-smart-contracts.md), making it a breeze to submit a DeFi related transaction.

![API returns transaction components](../../static/img/assets/transaction-data.png)

This API returns a transaction object which includes all of the contextual data needed to be consumed by [Web3](https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#sendtransaction), [Ethers](https://docs.ethers.io/v5/) or other smart Contract. This enables anyone to assemble and execute a complex Zap including multi exchange hops and interacting with several DeFi apps in a single atomic transaction. 

:::tip
To learn and see all of Zapper's public API endpoints, check out the [Swagger UI](https://api.zapper.fi/api/static/index.html#/) page. 

For any API-related inquiries, please reach out in the [#build-on-zapper channel](https://discord.com/channels/647279669388771329/650654989202489354) in the [Zapper Discord](https://zapper.fi/discord).
:::
