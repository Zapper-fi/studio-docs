---
sidebar_position: 1
---

# Getting started

![](..static/img/assets/zapper_api_logo.png)

The Zapper API provides some of the most robust DeFi related data, everything from liquidity and prices on different AMMs to complex DeFi app balances all in one convenient place. In addition, the API also supports bridging between different networks as well as formatted Zap transaction endpoints.

{% hint style="info" %}
We ask that builders using the API include our **"Powered by Zapper"** logo with a backlink to [https://zapper.fi](https://zapper.fi) in their project. **"Powered by Zapper"**  brand asset can be downloaded [here](../docs/brand-assets.md).
{% endhint %}

## Endpoints

The Zapper Developer APIs provides the Ethereum community with accessible and consistent DeFi data for an ever increasing number of apps. For a full list of supported apps, [see here](https://zapper.fi/protocols). Check out the [guides section](https://docs.zapper.fi/zapper-api/api-guides#data-api) to see how to query account balances, pool stats, and more.

![](../.gitbook/assets/data_api.png)

## Transactional Endpoints

The Zapper API Transaction endpoints makes it easy for builders to interact directly with a wide range of DeFi apps. Get an easy to consume transaction for approving, adding, removing, and rebalancing liquidity through any of [our zap contracts](../zapper-smart-contracts/smart-contracts.md), making it a breeze to submit a DeFi related transaction.

![API returns transaction components](../.gitbook/assets/transaction-data.png)

This API returns a transaction object which includes all of the contextual data needed to be consumed by [Web3](https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#sendtransaction), [Ethers](https://docs.ethers.io/v5/) or other smart Contract. This enables anyone to assemble and execute a complex Zap including multi exchange hops and interacting with several DeFi apps in a single atomic transaction. To learn more, check out the [guides](api-guides/) section.

::: For any API related inquiries, please reach out in the [#build-on-zapper channel](https://discord.com/channels/647279669388771329/650654989202489354) in the [Zapper Discord](https://zapper.fi/discord).
:::