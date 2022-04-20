---
sidebar_position: 2
---

# API keys

The Zapper API uses [API keys](https://swagger.io/docs/specification/authentication/api-keys/) to authenticate requests.

## Public API Key

Zapper has made available for public use the following API key *96e0cc51-a62e-42ca-acee-910ea7d2a241*

As of March 2022, Zapper began rate limiting query volume on the public API key. See below for how to get a Private API key if find you are hitting rate limit errors using the public key. <!--TODO add danger text-->

## Getting a Private API key to get a higher rate limit

If you are hitting the rate limit on the Public Key, you should request a private API key via Zapper's [ZenDesk ticket](https://zapperfi.zendesk.com/hc/en-us/requests/new) system. You will be issued a private API key in 24-48 hours. 

These private API keys still have a rate limit, but it is significantly higher than the public API key's. If the rate limit is not sufficient, you may also request a higher rate limit for your API key by via the same ZenDesk ticket link.

<-->

## Data Endpoints

The Zapper Developer APIs provides the Ethereum community with accessible and consistent DeFi data for an ever increasing number of protocols. For a full list of supported protocols, [see here][xxxx]. Check out the [guides section](xxxxx) <!--TODO add link--> to see how to query account balances, pool stats, and more.

<!--TODO insert image-->

## Transactional Endpoints

The Zapper API Transaction endpoints makes it easy for builders to interact directly with a wide range of DeFi protocols. Get an easy to consume transaction for approving, adding, removing, and rebalancing liquidity through any of [our zap contracts](xxx) <!--TODO add link-->, making it a breeze to submit a DeFi related transaction.

<!--TODO insert image-->

This API returns a transaction object which includes all of the contextual data needed to be consumed by [Web3](https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#sendtransaction), [Ethers](xxxx) <!--TODO add link--> or other Smart Contracts. This enables anyone to assemble and execute a complex Zap including multi exchange hops and interacting with several DeFi protocols in a single atomic transaction. To learn more, check out the [guides](xxx) <!--TODO add link--> section.

<!--TODO add info box-->
::: For any API related inquiries, please reach out in the [#build-on-zapper channel](https://discord.com/channels/647279669388771329/650654989202489354) in the [Zapper Discord](https://zapper.fi/discord).
:::