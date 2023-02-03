---
sidebar_position: 4
---

# API Schema

See below for details on each of Zapper's API endpoints.
[Swagger docs to test these endpoints can be found here.](https://api.zapper.xyz/api/static/index.html#)

## Wallet-specific App and ERC20 Token Balances endpoints

### `v2/balances/apps`

*This endpoint was launched in January 2023, replacing the historical [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) endpoint*

You input wallet addresses and get all the following:

- Detailed breakdown of all app investment positions represented as app tokens owned by the wallet, such as Aave lending positions or Uniswap pools, valued in USD
- Detailed breakdown of all app investment positions represented as contract positions that are not held on the wallet, such ve-locked or farming positions, valued in USD

On Zapper's frontend, all tokens that show up in the *Wallet* section of a portfoilo are returned in the [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens) endpoint. All values showing up in the *Apps* section of a portfolio are returned in the `v2/balances/apps` endpoint.

For a list of all supported apps, see [this link](https://zapper.xyz/protocols).

By doing a GET command on this endpoint, you will be returned the cached values Zapper has in its database for the wallets provided. Many wallets already had their balances recently computed by Zapper, and so are sitting in the cache. However, if there is no cached value, the GET response will not contain anything. Cached values for apps are never purged, so could be months or years old. Keep this in mind!

If there is no cached value, or you want Zapper to re-compute the balance so it as fresh as possible, you will need to do a POST command to this endpoint. Once the POST command is received, Zapper will return you a `jobId` value and Zapper will then re-compute the wallet's app balances. You can monitor the status of the re-computation job via [`v2/balances/job-status`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesjob-status) by passing in the `jobId` value. Alternatively, you can just wait 10 seconds for the job to finish if you do not want to poll for the job status.

Once the re-calculation job is completed, you can retrieve the newly computed app balances by calling GET `v2/balances/apps`.

Points Cost For `v2/balances/apps` Related Queries:

- 0.25 points per GET `v2/balances/apps` call per wallet included in the call, as this is simply retrieving the value in Zapper's database
- 4 points per POST `v2/balances/apps` call per wallet included in the call. This call triggers Zapper recomputing the wallet's balances, generating a large volume of downstream API calls. A `jobId` will be included in the response
- 0 points per call GET [`v2/balances/job-status`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesjob-status), used to monitor the status of the `jobId`. These calls are free, allowing you to poll the status of the computation job

:::info
Note that this endpoint differs from [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) as it does NOT contain base token balances, but only contains balances related to a particular app.

- To get token balances, call GET [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens)
- To get NFT values, call GET [`v2/nft/balances/net-worth`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftbalancesnet-worth)
:::

Tips On Using This Endpoint Cost-Effectively:

- If you are querying a wallet for the first time, and it is a potentially popular wallet, there is a chance that a cached value already exists, and you can retry it for only 0.25 points cost. Upon getting the results, you can check how stale the balances are based on the value returned of `updatedAt`
- If you are certain you will want the most up-to-date balances for the wallet, you should call the POST `v2/balances/apps` endpoint first, wait for the job to run after 10s, and then call GET `v2/balances/apps`
- If you are surfacing balances to users in real-time using this call, you can emulate what Zapper's frontend does by first calling GET `v2/balances/apps` to get any cached balances, use these to create a skeleton to display to the user, and then call POST `v2/balances/apps` to then refresh any stale values

Other things to know about this endpoint

- Maximum of 30 RPM (requests per minute)
- Maximum of 15 wallets can be passed into 1 call as parameters. Any more beyond 15 wallets, and the query will fail. And, though we support multiple wallets bundled into 1 call, it's recommended you **query wallets one at a time** for best performance
- Any balance less than $0.01 USD value is not included in the output

Path

`v2/balances/apps`

Parameters

- `addresses[]`: **Required** | Addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses
  - Note: to pass multiple addresses in, the right syntax is `https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=address_1&addresses%5B%5D=address_2`
- `network[]`: networks for which to retrieve balances, inputted an array. Available values : ethereum, polygon, optimism, gnosis, binance-smart-chain, fantom, avalanche, arbitrum, celo, moonriver, bitcoin, aurora

Response

- `key`: a unique identifier on the token object that is used to aggregate token balances across multiple addresses. [More details found here](https://docs.zapper.xyz/docs/concepts/app-tokens#what-is-key-why-is-it-useful)
- `addresses`: address the position queried is for
- `appId`: ID of the app
- `AppName`: Display name of app
- `AppImage`: Icon of the app
- `network`: network the app is on
- `updatedAt`: timestamp at which time this wallet's balance for this app was calculated
- `balanceUSD`: value of all positions associated with this app on this network for this wallet, in USD
- `products`: object containing details on all products owned by this wallet
  - `label`: human-readable label of asset group, such as "pools" or "farms"
  - `assets`: object containing all metadata about this group of assets and the positions within the group
    - `tokens`: object containing details about the underlying tokens that comprise this investment positions, such as symbol, wallet, network, balance. A pool token of USDC / DAI would have its underlying tokens reported as USDC and DAI
    - `symbol`: symbol for investment position
    - `decimals`: decimals for position; usually 18 for ERC-20 tokens
    - `supply`: total amount of supply of this position
    - `pricePerShare`: the ratio between the token price and the prices of the underlying tokens. This property is useful for using the balance of the token to determine the exposure to the underlying tokens. [More details and examples found here.](https://docs.zapper.xyz/docs/concepts/app-tokens#what-is-pricepershare-why-is-it-useful)
    - `price`: The price of one unit of this token. In the case of aDAI, the tokens are minted 1:1, so the price is the same as the underlying DAI token.
    - `dataProps`: object containing data used for augmenting the token object with additional data properties. These properties can be used in other places in the application. This would include APY, liquidity in the positions, etc. [More details found here](https://docs.zapper.xyz/docs/concepts/app-tokens#what-are-data-props)
    - `displayProps`: object is used by Zapper Web and Zapper Mobile to render meaningful information to Zapper users about this token. This generally would include labels and decorators. [More details can be found here](https://docs.zapper.xyz/docs/concepts/app-tokens#what-are-display-props)
    - `balance`: balance of investment positioned owned by this wallet. Normalized for decimals
    - `balanceRaw`: raw balance of investment in this postiion owned by this wallet. This has not been normalized with decimals yet; to get balanceRaw, you'd multiply this value by 10 ^ (decimals) value
    - `balanceUSD`: value of `balance` position, converted to USD
  - `meta`: Information about balances that is not specifically balances. This value is developer defined, but examples are health factors and collateralization ratios (c-ratios)

  
cURL for POST

```js
cURL -X 'POST' \
  'https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=0xe321bD63CDE8Ea046b382f82964575f2A5586474' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

cURL for GET

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=0xe321bD63CDE8Ea046b382f82964575f2A5586474' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response for POST

```JSON
{
   "jobId": "f7a84c5d-8605-4ad5-8c5e-ae65e07cfafd"
}
```

Response for GET

```JSON
[
    {
        "key": "597563987",
        "address": "0xe321bd63cde8ea046b382f82964575f2a5586474",
        "appId": "sushiswap",
        "appName": "SushiSwap",
        "appImage": "https://storage.googleapis.com/zapper-fi-assets/apps/sushiswap.png",
        "network": "ethereum",
        "updatedAt": "2023-01-26T22:51:36.215Z",
        "balanceUSD": 84.1847791577147,
        "products": [
            {
                "label": "Pools",
                "assets": [
                    {
                        "key": "2041256716",
                        "type": "app-token",
                        "appId": "sushiswap",
                        "groupId": "pool",
                        "network": "ethereum",
                        "address": "0xceff51756c56ceffca006cd410b03ffc46dd3a58",
                        "tokens": [
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
                                "symbol": "WBTC",
                                "decimals": 8,
                                "price": 23042,
                                "balance": 0.00035964,
                                "balanceRaw": "35964",
                                "balanceUSD": 8.28682488
                            },
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                                "symbol": "WETH",
                                "decimals": 18,
                                "price": 1604.44,
                                "balance": 0.005167346483200388,
                                "balanceRaw": "5167346483200388",
                                "balanceUSD": 8.290697391506031
                            }
                        ],
                        "symbol": "SLP",
                        "decimals": 18,
                        "supply": 0.000624160526773982,
                        "pricePerShare": [
                            661196.580794739,
                            9500203.420152755
                        ],
                        "price": 30477797990.102264,
                        "dataProps": {
                            "liquidity": 19023038.448413238,
                            "reserves": [
                                412.69280617,
                                5929.651971182529
                            ],
                            "apy": 0.9984024219112746,
                            "fee": 0.3,
                            "volume": 173448.83706855774
                        },
                        "displayProps": {
                            "label": "WBTC / WETH",
                            "secondaryLabel": "50% / 50%",
                            "tertiaryLabel": "0.998% APY",
                            "images": [
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
                            ],
                            "statsItems": [
                                {
                                    "label": "Fee",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.3
                                    }
                                },
                                {
                                    "label": "Liquidity",
                                    "value": {
                                        "type": "dollar",
                                        "value": 19023038.448413238
                                    }
                                },
                                {
                                    "label": "Reserves",
                                    "value": "412.69 / 5929.65"
                                },
                                {
                                    "label": "Ratio",
                                    "value": "50% / 50%"
                                },
                                {
                                    "label": "Volume",
                                    "value": {
                                        "type": "dollar",
                                        "value": 173448.83706855774
                                    }
                                },
                                {
                                    "label": "APY",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.9984024219112746
                                    }
                                },
                                {
                                    "label": "Share",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.00008714417824710687
                                    }
                                }
                            ]
                        },
                        "balance": 5.43919562e-10,
                        "balanceRaw": "543919562",
                        "balanceUSD": 16.577470533500904
                    },
                    {
                        "key": "1102926257",
                        "type": "app-token",
                        "appId": "sushiswap",
                        "groupId": "pool",
                        "network": "ethereum",
                        "address": "0x5ba61c0a8c4dcccc200cd0ccc40a5725a426d002",
                        "tokens": [
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68",
                                "symbol": "INV",
                                "decimals": 18,
                                "price": 73.5,
                                "balance": 0.34627294833442135,
                                "balanceRaw": "346272948334421344",
                                "balanceUSD": 25.45106170257997
                            },
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0x865377367054516e17014ccded1e7d814edc9ce4",
                                "symbol": "DOLA",
                                "decimals": 18,
                                "price": 1.002,
                                "balance": 24.826974193289097,
                                "balanceRaw": "24826974193289097207",
                                "balanceUSD": 24.876628141675674
                            }
                        ],
                        "symbol": "SLP",
                        "decimals": 18,
                        "supply": 2430.5465150535374,
                        "pricePerShare": [
                            0.13345830915638018,
                            9.568653899309185
                        ],
                        "price": 19.396976930101747,
                        "dataProps": {
                            "liquidity": 47145.25468003267,
                            "reserves": [
                                324.3766282249775,
                                23257.058388719382
                            ],
                            "apy": 0,
                            "fee": 0.3,
                            "volume": 0
                        },
                        "displayProps": {
                            "label": "INV / DOLA",
                            "secondaryLabel": "51% / 49%",
                            "images": [
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68.png",
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x865377367054516e17014ccded1e7d814edc9ce4.png"
                            ],
                            "statsItems": [
                                {
                                    "label": "Fee",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.3
                                    }
                                },
                                {
                                    "label": "Liquidity",
                                    "value": {
                                        "type": "dollar",
                                        "value": 47145.25468003267
                                    }
                                },
                                {
                                    "label": "Reserves",
                                    "value": "324.38 / 23257.06"
                                },
                                {
                                    "label": "Ratio",
                                    "value": "51% / 49%"
                                },
                                {
                                    "label": "Volume",
                                    "value": {
                                        "type": "dollar",
                                        "value": 0
                                    }
                                },
                                {
                                    "label": "APY",
                                    "value": {
                                        "type": "pct",
                                        "value": 0
                                    }
                                },
                                {
                                    "label": "Share",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.10675027674751501
                                    }
                                }
                            ]
                        },
                        "balance": 2.594615131296733,
                        "balanceRaw": "2594615131296732998",
                        "balanceUSD": 50.32768984425565
                    },
                    {
                        "key": "2487522344",
                        "type": "app-token",
                        "appId": "sushiswap",
                        "groupId": "pool",
                        "network": "ethereum",
                        "address": "0x96f5b7c2be10dc7de02fa8858a8f1bd19c2fa72a",
                        "tokens": [
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0x0f51bb10119727a7e5ea3538074fb341f56b09ad",
                                "symbol": "DAO",
                                "decimals": 18,
                                "price": 0.914175,
                                "balance": 7.949186191616225,
                                "balanceRaw": "7949186191616224922",
                                "balanceUSD": 7.266947286720763
                            },
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                                "symbol": "WETH",
                                "decimals": 18,
                                "price": 1604.44,
                                "balance": 0.004506479893091937,
                                "balanceRaw": "4506479893091937",
                                "balanceUSD": 7.230376599672428
                            }
                        ],
                        "symbol": "SLP",
                        "decimals": 18,
                        "supply": 391.4512789823146,
                        "pricePerShare": [
                            54.40594087149234,
                            0.03084331813245392
                        ],
                        "price": 99.22280434063089,
                        "dataProps": {
                            "liquidity": 38840.89366335192,
                            "reserves": [
                                21297.27513838186,
                                12.073656331007502
                            ],
                            "apy": 6.190128263439032,
                            "fee": 0.3,
                            "volume": 2195.7088003903627
                        },
                        "displayProps": {
                            "label": "DAO / WETH",
                            "secondaryLabel": "50% / 50%",
                            "tertiaryLabel": "6.190% APY",
                            "images": [
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0f51bb10119727a7e5ea3538074fb341f56b09ad.png",
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
                            ],
                            "statsItems": [
                                {
                                    "label": "Fee",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.3
                                    }
                                },
                                {
                                    "label": "Liquidity",
                                    "value": {
                                        "type": "dollar",
                                        "value": 38840.89366335192
                                    }
                                },
                                {
                                    "label": "Reserves",
                                    "value": "21297.28 / 12.07"
                                },
                                {
                                    "label": "Ratio",
                                    "value": "50% / 50%"
                                },
                                {
                                    "label": "Volume",
                                    "value": {
                                        "type": "dollar",
                                        "value": 2195.7088003903627
                                    }
                                },
                                {
                                    "label": "APY",
                                    "value": {
                                        "type": "pct",
                                        "value": 6.190128263439032
                                    }
                                },
                                {
                                    "label": "Share",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.03732489785648792
                                    }
                                }
                            ]
                        },
                        "balance": 0.14610879003806448,
                        "balanceRaw": "146108790038064476",
                        "balanceUSD": 14.497323886393191
                    },
                    {
                        "key": "572360583",
                        "type": "app-token",
                        "appId": "sushiswap",
                        "groupId": "pool",
                        "network": "ethereum",
                        "address": "0x5399a36f54ca91a5db5c148eeb2b909bba81b82c",
                        "tokens": [
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0x630d98424efe0ea27fb1b3ab7741907dffeaad78",
                                "symbol": "PEAK",
                                "decimals": 8,
                                "price": 0.00333081,
                                "balance": 420.53795766,
                                "balanceRaw": "42053795766",
                                "balanceUSD": 1.4007320347535046
                            },
                            {
                                "type": "base-token",
                                "network": "ethereum",
                                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                                "symbol": "WETH",
                                "decimals": 18,
                                "price": 1604.44,
                                "balance": 0.000861087269578818,
                                "balanceRaw": "861087269578818",
                                "balanceUSD": 1.3815628588030389
                            }
                        ],
                        "symbol": "SLP",
                        "decimals": 18,
                        "supply": 0.03435689610847085,
                        "pricePerShare": [
                            77481769.44202168,
                            158.6505191155818
                        ],
                        "price": 512622.29136498435,
                        "dataProps": {
                            "liquidity": 17612.11080731304,
                            "reserves": [
                                2662033.10302003,
                                5.450739402809012
                            ],
                            "apy": 1.202818269501406,
                            "fee": 0.3,
                            "volume": 193.46272733807564
                        },
                        "displayProps": {
                            "label": "PEAK / WETH",
                            "secondaryLabel": "50% / 50%",
                            "tertiaryLabel": "1.203% APY",
                            "images": [
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x630d98424efe0ea27fb1b3ab7741907dffeaad78.png",
                                "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
                            ],
                            "statsItems": [
                                {
                                    "label": "Fee",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.3
                                    }
                                },
                                {
                                    "label": "Liquidity",
                                    "value": {
                                        "type": "dollar",
                                        "value": 17612.11080731304
                                    }
                                },
                                {
                                    "label": "Reserves",
                                    "value": "2662033.10 / 5.45"
                                },
                                {
                                    "label": "Ratio",
                                    "value": "50% / 50%"
                                },
                                {
                                    "label": "Volume",
                                    "value": {
                                        "type": "dollar",
                                        "value": 193.46272733807564
                                    }
                                },
                                {
                                    "label": "APY",
                                    "value": {
                                        "type": "pct",
                                        "value": 1.202818269501406
                                    }
                                },
                                {
                                    "label": "Share",
                                    "value": {
                                        "type": "pct",
                                        "value": 0.01579762314696352
                                    }
                                }
                            ]
                        },
                        "balance": 0.00000542757297221,
                        "balanceRaw": "5427572972210",
                        "balanceUSD": 2.7822948935649485
                    }
                ],
                "meta": []
            }
        ]
    },
    ...
```

### `v2/balances/tokens`

*This endpoint was launched in January 2023, replacing the historical [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) endpoint*

You input wallet addresses and get all "base tokens" in the wallet. "Base tokens" are ERC20 tokens that are not invested by the user in an app, but instead sit in the wallet natively. Base tokens are often  liquid and tradable, whereas app tokens are those invested in apps are illiquid and cannot be natively traded, like a Uniswap pool token.

On Zapper's frontend, all tokens that show up in the *Wallet* section of a portfoilo are returned in the `v2/balances/tokens` endpoint. All values showing up in the *Apps* section of a portfolio are returned in the [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) endpoint.

Zapper supports over 15,000 base tokens (and counting).

By doing a GET command on this endpoint, you will be returned the cached token balances Zapper has in its database for the wallets provided. Many wallets already had their token balances recently computed by Zapper, and so are sitting in the cache. However, if there is no cached value, the GET response will not contain anything. Cached values are purged after 30 days, as Zapper then considers those balances stale.

If there is no cached value, or you want Zapper to re-compute the token balance so it as fresh as possible, you will need to do a POST command to this endpoint. Once the POST command is received, Zapper will return you a `jobId` value and Zapper will then re-compute the wallet's app balances. You can monitor the status of the re-computation job via [`v2/balances/job-status`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesjob-status) by passing in the `jobId` value. Alternatively, you can just wait 10 seconds for the job to finish if you do not want to poll for the job status.

Once the re-calculation job is completed, you can retrieve the newly computed app balances by calling GET `v2/balances/tokens`.

Points Cost For `v2/balances/tokens` Related Queries:

- 0.25 points per GET `v2/balances/tokens` call per wallet included in the call, as this is simply retrieving the value in Zapper's database
- 1 points per POST `v2/balances/tokens` call per wallet included in the call. This call triggers Zapper recomputing the wallet's balances, generating a large volume of downstream API calls. A `jobId` will be included in the response
- 0 points per call GET `v2/balances/job-status?jobId=:jobId`, used to monitor the status of the `jobId`. These calls are free, allowing you to poll the status of the computation job

:::info
Note that this endpoint differs from [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) as it does NOT contain app-related balances (like uniswap pools or AAVE lending poisitions), but only contains balances related to "base tokens", or ERC20 tokens that are not invested in a given app. To get the full value of a wallet's assets, you should also call GET [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) app balances and call [`v2/nft/balances/net-worth`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftbalancesnet-worth) to get NFT related balances
:::

Tips On Using This Endpoint Cost-Effectively:

- If you are querying a wallet for the first time, and it is a potentially popular wallet, there is a chance that a cached value already exists, and you can retrie it for only 0.25 points cost. Upon getting the results, you can check how stale the balances are based on the value retuend of `updatedAt`
- If you are certain you will want the most up-to-date balances for the wallet, you should call the POST [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) endpoint first, wait for the job to run after 10s, and then call GET [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps)
- If you are surfacing balances to users in real-time using this call, you can emulate what Zapper's frontend does by first calling GET [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) to get any cached balances, use these to create a skeleton to display to the user, and then call POST [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) to then refresh any stale values

Other things to know about this endpoint:

- Maximum of 30 RPM (requests per minute)
- Maximum of 15 wallets can be passed into 1 call as parameters. Any more beyond 15 wallets, and the query will fail. And, though we support multiple wallets bundled into 1 call, it's recommended you query wallets one at a time for best performance
- Any balance less than $0.01 USD value is not included in the output

Path

`v2/balances/tokens`

Parameters

- `addresses[]`: **Required** | addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses
  - Note: to pass multiple addresses in, the right syntax is `https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=address_1&addresses%5B%5D=address_2`
- `network[]`: networks for which to retrieve balances, inputted an array. Available values : ethereum, polygon, optimism, gnosis, binance-smart-chain, fantom, avalanche, arbitrum, celo, moonriver, bitcoin, aurora

Response

- `key`: a unique identifier on the token object that is used to aggregate token balances across multiple addresses. [More details found here](https://docs.zapper.xyz/docs/concepts/app-tokens#what-is-key-why-is-it-useful)
- `address`: address the position queried is for
- `network`: network the app is on
- `updatedAt`: time at which this token balance was calculated. This value should be used to determine if this cached balance is considered too "stale" for your purposes, and thus should be re-calculated via a `POST` command on this endpoint
- `token`:  object containing details about the token, such as metadata, price and balance
  - `id`: internal token id
  - `networkId`: internal network id
  - `address`: token's address on the network
  - `name`: label for token
  - `symbol`: symbol for token
  - `decimals`: decimals for token
  - `coingeckoId`: coingecko API id for token
  - `status`: internal designation if token has been initially reviewed when ingested
  - `hide`: internal designation if token is approved for displaying
  - `canExchange`: flag if this token is exchangeable on Zapper's front end
  - `verified`: if token is on a verified token list or manually verified, and has a blue-checkmark on Zapper's frontend when swapping or bridging
  - `externallyVerified`: flag indicating if the token is verified because it was on an external tokenlist
  - `priceUpdatedAt`: last time the price for this token was updated from CoinGecko
  - `updatedAt`: last date token was updated from CoinGecko
  - `createdAt`: date token was first ingested into Zapper
  - `price`: current price of token in USD
  - `dailyVolume`: trading volume of token from coingecko
  - `totalSupply`: total supply of token available
  - `holdersEnabled`: internal designation as to whether Zapper index's the holders of this token
  - `marketCap`: estimated value of all the tradeable tokens
  - `balance`: balance of investment positioned owned by this wallet. Normalized for decimals
  - `balanceRaw`: raw balance of investment in this postiion owned by this wallet. This has not been normalized with decimals yet; to get balanceRaw, you'd multiply this value by 10 ^ (decimals) value
  - `balanceUSD`: value of `balance` position, converted to USD

cURL for POST

```js
cURL -X 'POST' \
  'https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=0xe321bD63CDE8Ea046b382f82964575f2A5586474' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

cURL for GET

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=0xe321bD63CDE8Ea046b382f82964575f2A5586474' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response for POST

```JSON
{
   "jobId": "f7a84c5d-8605-4ad5-8c5e-ae65e07cfafd"
}
```

Response for GET

```JSON
{
    "0xe321bd63cde8ea046b382f82964575f2a5586474": [
        {
            "key": "766222898",
            "address": "0xe321bd63cde8ea046b382f82964575f2a5586474",
            "network": "ethereum",
            "token": {
                "id": "1697",
                "networkId": 1,
                "address": "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
                "name": "Graph Token",
                "symbol": "GRT",
                "decimals": 18,
                "coingeckoId": "the-graph",
                "status": "approved",
                "hide": false,
                "canExchange": true,
                "verified": false,
                "externallyVerified": true,
                "priceUpdatedAt": "2023-01-27T01:07:33.608Z",
                "updatedAt": "2023-01-27T01:07:33.608Z",
                "createdAt": "2022-05-18T12:54:47.695Z",
                "price": 0.091389,
                "dailyVolume": 62326378.164690085,
                "totalSupply": "10570595387.699024621145719417",
                "holdersEnabled": true,
                "marketCap": 806898760.8415607,
                "balance": 188.92803409735453,
                "balanceUSD": 17.265944108123133,
                "balanceRaw": "188928034097354517811"
            }
        },
        ...
```

### `v2/balances/job-status`

*This endpoint was launched in January 2023, replacing the historical [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) endpoint*

Use this endpoint to poll for the status of a job that is calculating app-related balances or base token balances, via [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) and [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens) respectively.

When you call POST [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) or [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens), a re-calculation of the balances in that wallet is triggered, and the response to those calls will be a value `jobId`. You can then monitor the status of the re-computation job by passing `jobId` as a parameter into this endpoint, `v2/balances/job-status`.

:::info
You are not required to poll for the status of the job via `v2/balances/job-status`; it is just a nice-to-have. Most POST [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) finish computing wihtin 10 seconds and POST [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens) finish within 2 seconds, so you could just insert a delay between your POST and GET commands of that time interval.
:::

Other things to know about this endpoint

- There is no points cost associated with this endpoint, so you may poll as much and as often as you wish, up to a global maximum of 1000 requests per minute

Path

`v2/balances/job-status`

Parameters

- `jobId`: **(required)** | the `jobId` associated with the computation job. The `jobId` is provided as the response of the POST [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) call or POST [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens) call

Response

- `jobId`: the `jobId` that was passed into the call
- `status`: current status of the computation job
  - `active` = Zapper is currently computing the balance. The results are not ready
  - `completed` = This computation job is complete. You can now call GET `v2/balances/*` to get the result
  - `unknown` = `jobId` that was passed is not in Zapper's system. Could be stale

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/balances/job-status?jobId=f7a84c5d-8605-4ad5-8c5e-ae65e07cfafd' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
{
    "jobId": "f7a84c5d-8605-4ad5-8c5e-ae65e07cfafd",
    "status": "active"
}
```

### `v2/balances`

The `v2/balances` endpoint is the most powerful of those offered by Zapper. You input wallet addresses and get all the following:

- All tokens the wallet owns, by network, valued in USD
- Detailed breakdown of all app investment positions represented as app tokens owned by the wallet, such as Aave lending positions or Uniswap pools, valued in USD
- Detailed breakdown of all app investment positions represented as contract positions that are not held on the wallet, such ve-locked or farming positions, valued in USD

:::danger
`v2/balances` endpoint was deprecated by Zapper in January 2023,, and will be turned down in May 2023. This endpoint will be phased out for [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps) and [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens) endpoints, which are more performant, cost less, and return a typcial JSON structure. Please do not build further on this endpoint, but instead migrate your queries to the other endpoints.
:::

Notes on use of the API and limits:

- Maximum of 30 RPM (requests per minute)
- Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance
- Any balance less than $0.01 USD value is not included in the output

Path

`v2/balances`

Response format

The response is in JSON, but is streamed from our endpoint. You will need to understand how to handle streamed responses.
[See our documentation on SSE handling here](https://studio.zapper.xyz/docs/apis/balance-v2-sse).

Parameters

- `addresses[]`: **(required)** | Addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses
- `networks[]`: Networks for which to retrieve balances, inputted an array. Available values : ethereum, polygon, optimism, gnosis, binance-smart-chain, fantom, avalanche, arbitrum, celo, moonriver, bitcoin, cronos, aurora
- `bundled`: Set to false to receive balance individually for each addresses, instead of bundled together

Returns

- `appId`: ID of the app
- `network`: network the app is on
- `addresses`: addresses queried for
- `balance`: details on the balance structure, and what kind of balance it is
- `type`: type of position the investment is. `contract-position` is if the investment is held on a 3rd party contract
- `app-token`: is if the wallet holds tokens in the wallet representing the investment
- `displayProps`: details on how to display the asset on Zapper's frontend

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/balances?addresses%5B%5D=0x3d280fde2ddb59323c891cf30995e1862510342f&bundled=false' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
event: balance
data: {"appId":"sudoswap","network":"ethereum","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{},"claimable":{},"locked":{},"nft":{}},"totals":[{"key":"2987028053","type":"contract-position","network":"ethereum","balanceUSD":7256.5594200000005}],"errors":[],"app":{"appId":"sudoswap","network":"ethereum","data":[{"key":"2987028053","type":"position","appId":"sudoswap","address":"0xea504f1857707c6c875cba618a33bd09fc4aefac","metaType":null,"balanceUSD":7256.5594200000005,"contractType":"contract-position","network":"ethereum","displayProps":{"label":"Chain Runners ↔ ETH - Price: 0.22Ξ","secondaryLabel":null,"tertiaryLabel":null,"images":["https://lh3.googleusercontent.com/3vScLGUcTB7yhItRYXuAFcPGFNJ3kgO0mXeUSUfEMBjGkGPKz__smtXyUlRxzZjr1Y5x8hz1QXoBQSEb8wm4oBByeQC_8WOCaDON4Go=s120","https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0000000000000000000000000000000000000000.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Sudoswap"}}],"balanceDisplayMode":"default"},"breakdown":[{"key":"917389808","appId":"nft","address":"0x97597002980134bea46250aa0510c9b90d87a587","network":"ethereum","balanceUSD":7256.5594200000005,"metaType":"supplied","type":"nft","contractType":"non-fungible-token","breakdown":[],"assets":[{"tokenId":"1976","assetImg":"https://web.zapper.xyz/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F1976&width=250&checksum=6f122","assetName":"Chain Runners #1976","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"2835","assetImg":"https://web.zapper.xyz/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F2835&width=250&checksum=f4896","assetName":"Chain Runners #2835","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"3067","assetImg":"https://web.zapper.xyz/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F3067&width=250&checksum=d3ddb","assetName":"Chain Runners #3067","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"3094","assetImg":"https://web.zapper.xyz/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F3094&width=250&checksum=83db0","assetName":"Chain Runners #3094","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"4605","assetImg":"https://web.zapper.xyz/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F4605&width=250&checksum=93684","assetName":"Chain Runners #4605","balance":1,"balanceUSD":219.89574000000002}],"context":{"incomplete":true,"openseaId":"18242","holdersCount":3341,"floorPrice":0.171,"amountHeld":33,"volume24h":0,"volume7d":0,"volume1m":0},"displayProps":{"label":"RUN","secondaryLabel":{"type":"linkVersion","value":2},"tertiaryLabel":null,"profileImage":"https://lh3.googleusercontent.com/3vScLGUcTB7yhItRYXuAFcPGFNJ3kgO0mXeUSUfEMBjGkGPKz__smtXyUlRxzZjr1Y5x8hz1QXoBQSEb8wm4oBByeQC_8WOCaDON4Go=s120","profileBanner":"https://lh3.googleusercontent.com/8MKiOEUA3COVcXKzhj54Q5eP0GP9NDOFsumbkiQ2KokimqYGlfTxLKei60ZUG_ipq-VZ5_D2rGZAjxmOVEIVSJaezvrwZe2IywOyEQ=s2500","featuredImg":"","featuredImage":"","images":[],"balanceDisplayMode":"default","stats":[],"info":[]}}]}],"displayProps":{"appName":"Sudoswap","images":["https://storage.googleapis.com/zapper-fi-assets/apps/sudoswap.png"]},"meta":{"total":7256.5594200000005}}}

event: balance
data: {"appId":"tokens","network":"ethereum","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{"2242939522":{"key":"2242939522","appId":"tokens","address":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","network":"ethereum","balanceUSD":164.645982,"metaType":"supplied","displayProps":{"label":"WETH","secondaryLabel":null,"tertiaryLabel":null,"images":["https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Tokens"}}],"balanceDisplayMode":"default"},"type":"token","contractType":"app-token","context":{"symbol":"WETH","balance":0.1280375,"decimals":18,"balanceRaw":"128037500000000000","price":1285.92},"breakdown":[]},"2616394601":{"key":"2616394601","appId":"tokens","address":"0x0000000000000000000000000000000000000000","network":"ethereum","balanceUSD":38016.69226492142,"metaType":"supplied","displayProps":{"label":"ETH","secondaryLabel":null,"tertiaryLabel":null,"images":["https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0000000000000000000000000000000000000000.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Tokens"}}],"balanceDisplayMode":"default"},"type":"token","contractType":"app-token","context":{"symbol":"ETH","balance":29.563808218957178,"decimals":18,"balanceRaw":"29563808218957175106","price":1285.92},"breakdown":[]}},"claimable":{},"locked":{},"nft":{}},"totals":[{"key":"2616394601","type":"app-token","network":"ethereum","balanceUSD":38016.69226492142},{"key":"2242939522","type":"app-token","network":"ethereum","balanceUSD":164.645982}],"errors":[]}

event: balance
data: {"appId":"tokens","network":"polygon","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{"3068350652":{"key":"3068350652","appId":"tokens","address":"0x0000000000000000000000000000000000000000","network":"polygon","balanceUSD":0.81355,"metaType":"supplied","displayProps":{"label":"MATIC","secondaryLabel":null,"tertiaryLabel":null,"images":["https://storage.googleapis.com/zapper-fi-assets/tokens/polygon/0x0000000000000000000000000000000000000000.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Tokens"}}],"balanceDisplayMode":"default"},"type":"token","contractType":"app-token","context":{"symbol":"MATIC","balance":1,"decimals":18,"balanceRaw":"1000000000000000000","price":0.81355},"breakdown":[]},"3291018073":{"key":"3291018073","appId":"tokens","address":"0x1599fe55cda767b1f631ee7d414b41f5d6de393d","network":"polygon","balanceUSD":575.7775786568517,"metaType":"supplied","displayProps":{"label":"MILK","secondaryLabel":null,"tertiaryLabel":null,"images":["https://storage.googleapis.com/zapper-fi-assets/tokens/polygon/0x1599fe55cda767b1f631ee7d414b41f5d6de393d.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Tokens"}}],"balanceDisplayMode":"default"},"type":"token","contractType":"app-token","context":{"symbol":"MILK","balance":1745044.9421332069,"decimals":18,"balanceRaw":"1745044942133206903703483","price":0.00032995},"breakdown":[]}},"claimable":{},"locked":{},"nft":{}},"totals":[{"key":"3068350652","type":"app-token","network":"polygon","balanceUSD":0.81355},{"key":"3291018073","type":"app-token","network":"polygon","balanceUSD":575.7775786568517}],"errors":[]}

event: balance
data: {"appId":"tokens","network":"optimism","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{"2177766732":{"key":"2177766732","appId":"tokens","address":"0x0000000000000000000000000000000000000000","network":"optimism","balanceUSD":0.7487512921509502,"metaType":"supplied","displayProps":{"label":"ETH","secondaryLabel":null,"tertiaryLabel":null,"images":["https://storage.googleapis.com/zapper-fi-assets/tokens/optimism/0x0000000000000000000000000000000000000000.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Tokens"}}],"balanceDisplayMode":"default"},"type":"token","contractType":"app-token","context":{"symbol":"ETH","balance":0.000582268953084912,"decimals":18,"balanceRaw":"582268953084912","price":1285.92},"breakdown":[]}},"claimable":{},"locked":{},"nft":{}},"totals":[{"key":"2177766732","type":"app-token","network":"optimism","balanceUSD":0.7487512921509502}],"errors":[]}

event: balance
data: {"appId":"tokens","network":"gnosis","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{},"claimable":{},"locked":{},"nft":{}},"totals":[],"errors":[]}

...

event: end
data: {}
```

### `v2/apps/{appSlug}/balances`

The `v2/apps/{appSlug}/balances` endpoint is similar to the [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) query,
but returns data only for a specific app, instead of ALL apps, tokens and NFTs in
a wallet. 

You input wallet addresses and get all the following:

- Detailed breakdown of all app investment positions represented as app tokens owned by the wallet, such as Aave lending positions or Uniswap pools, valued in USD
- Detailed breakdown of all app investment positions represented as contract positions that are not held on the wallet, such ve-locked or farming positions, valued in USD

If you query for `appSlug` = `tokens`, you will get all tokens held in the wallet
that are not associated with an App.

Notes on use of the API and limits

- Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance
- Any balance less than $0.01 USD value is not included in the output

Path

`v2/apps/{appSlug}/balances`

Parameters

- `appSlug`: **(required)** | appSlug of the desired app. This is interchangeable with `appId`, a value used in other queries
- `addresses[]`: **(required)** | addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses
- `networks[]`: Networks for which to retrieve balances, inputted an array

Returns

- `appId`: ID of the app. Same as `appSlug`
- `network`: network the app is on
- `groupId`: group this particular investment belongs to within in the app, such as `pool` or `farms`
- `balance`: details on the balance structure, and what kind of balance it is
- `type`: type of position the investment is. `contract-position` is if the investment is held on a 3rd party contract. `app-token` is if the wallet holds tokens in the wallet representing the investment
- `address`: address of token
- `symbol`: symbol of token
- `decimals`: decimals of token
- `supply`: supply of token
- `pricePerShare`: ratio of price to supply of assets
- `tokens`: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc
- `displayProps`: details on how to display the asset on Zapper's frontend
- `statsItems`: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc
- `meta`: total value of all positions in the app (example below has 3 different uniswap v2 positions)

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps/uniswap-v2/balances?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
{
  "balances": {
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {
      "products": [
        {
          "label": "Pools",
          "assets": [
            {
              "type": "app-token",
              "address": "0x3d1cb7638d73657f7e554eda1d97703bc29d3c15",
              "symbol": "UNI-V2",
              "decimals": 18,
              "supply": 0.000415355547741061,
              "network": "ethereum",
              "appSlug": "uniswap-v2",
              "groupId": "pool",
              "pricePerShare": [
                5470934.419387214,
                1888.4681561297648
              ],
              "price": 4856007.016672078,
              "tokens": [
                {
                  "type": "base-token",
                  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                  "network": "ethereum",
                  "symbol": "TKS",
                  "decimals": 8,
                  "price": 0.44380051417395594,
                  "balance": 399.23888346,
                  "balanceRaw": "39923888346",
                  "balanceUSD": 177.18242175778408
                },
                {
                  "id": "3067",
                  "networkId": 1,
                  "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                  "name": "Wrapped Ether",
                  "symbol": "WETH",
                  "decimals": 18,
                  "coingeckoId": "weth",
                  "status": "approved",
                  "hide": false,
                  "canExchange": true,
                  "verified": true,
                  "updatedAt": "2022-10-20T22:07:31.682Z",
                  "createdAt": "2022-05-18T12:54:47.695Z",
                  "price": 1285.7,
                  "dailyVolume": 271291690.7628123,
                  "totalSupply": "4124756.609295726227361804",
                  "networkEnumValue": "ethereum",
                  "type": "base-token",
                  "network": "ethereum",
                  "balance": 0.1378100814798281,
                  "balanceRaw": "137810081479828091",
                  "balanceUSD": 177.182421758615
                }
              ],
              "dataProps": {
                "liquidity": 2016.9694542442662,
                "fee": 0.003,
                "volume": 0,
                "volumeChangePercentage": 0,
                "isBlocked": false
              },
              "displayProps": {
                "label": "TKS / WETH",
                "secondaryLabel": "50% / 50%",
                "images": [
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xd8da6bf26964af9d7eed9e03e53415d37aa96045.png",
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
                ],
                "statsItems": [
                  {
                    "label": "Liquidity",
                    "value": {
                      "type": "dollar",
                      "value": 2016.9694542442662
                    }
                  },
                  {
                    "label": "Volume",
                    "value": {
                      "type": "dollar",
                      "value": 0
                    }
                  },
                  {
                    "label": "Fee",
                    "value": {
                      "type": "pct",
                      "value": 0.003
                    }
                  },
                  {
                    "label": "Ratio",
                    "value": "50% / 50%"
                  },
                  {
                    "label": "Share",
                    "value": {
                      "type": "pct",
                      "value": 17.569172541088687
                    }
                  }
                ]
              },
              "balance": 0.000072974532841611,
              "balanceRaw": "72974532841611",
              "balanceUSD": 354.36484351723
            },
            {
              "type": "app-token",
              "address": "0x87ffcda0c507117683f0bc0defb683eebe9c223b",
              "symbol": "UNI-V2",
              "decimals": 18,
              "supply": 110,
              "network": "ethereum",
              "appSlug": "uniswap-v2",
              "groupId": "pool",
              "pricePerShare": [
                1.6242098737743684,
                0.6210360351628103
              ],
              "price": 1.2420720703256205,
              "tokens": [
                {
                  "type": "base-token",
                  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                  "network": "ethereum",
                  "symbol": "LTI",
                  "decimals": 18,
                  "price": 0.3823619380663137,
                  "balance": 16.242098737743685,
                  "balanceRaw": "16242098737743684000",
                  "balanceUSD": 6.210360351628102
                },
                {
                  "id": "1250",
                  "networkId": 1,
                  "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
                  "name": "Dai Stablecoin",
                  "symbol": "DAI",
                  "decimals": 18,
                  "coingeckoId": "dai",
                  "status": "approved",
                  "hide": false,
                  "canExchange": true,
                  "verified": true,
                  "updatedAt": "2022-10-20T22:07:31.682Z",
                  "createdAt": "2022-05-18T12:54:47.695Z",
                  "price": 1,
                  "dailyVolume": 197395236.34528837,
                  "totalSupply": "5795048615.254160821608322693",
                  "networkEnumValue": "ethereum",
                  "type": "base-token",
                  "network": "ethereum",
                  "balance": 6.210360351628102,
                  "balanceRaw": "6210360351628103000",
                  "balanceUSD": 6.210360351628102
                }
              ],
              "dataProps": {
                "liquidity": 136.62792773581825,
                "fee": 0.003,
                "volume": 0,
                "volumeChangePercentage": 0,
                "isBlocked": false
              },
              "displayProps": {
                "label": "LTI / DAI",
                "secondaryLabel": "50% / 50%",
                "images": [
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xd8da6bf26964af9d7eed9e03e53415d37aa96045.png",
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png"
                ],
                "statsItems": [
                  {
                    "label": "Liquidity",
                    "value": {
                      "type": "dollar",
                      "value": 136.62792773581825
                    }
                  },
                  {
                    "label": "Volume",
                    "value": {
                      "type": "dollar",
                      "value": 0
                    }
                  },
                  {
                    "label": "Fee",
                    "value": {
                      "type": "pct",
                      "value": 0.003
                    }
                  },
                  {
                    "label": "Ratio",
                    "value": "50% / 50%"
                  },
                  {
                    "label": "Share",
                    "value": {
                      "type": "pct",
                      "value": 9.090909090909092
                    }
                  }
                ]
              },
              "balance": 10,
              "balanceRaw": "10000000000000000000",
              "balanceUSD": 12.420720703256205
            },
            {
              "type": "app-token",
              "address": "0xa7f8de1f0e6964201d412fd172e5740663b35567",
              "symbol": "UNI-V2",
              "decimals": 18,
              "supply": 546200,
              "network": "ethereum",
              "appId": "uniswap-v2",
              "groupId": "pool",
              "pricePerShare": [
                1711821.642103836,
                5.899402170822708e-7
              ],
              "price": 0.0015169722742053512,
              "tokens": [
                {
                  "type": "base-token",
                  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                  "network": "ethereum",
                  "symbol": "FLOKIS",
                  "decimals": 18,
                  "price": 4.43087129200267e-10,
                  "balance": 507041570391.1562,
                  "balanceRaw": "507041570391156223200000000000",
                  "balanceUSD": 224.6635938098125
                },
                {
                  "id": "3067",
                  "networkId": 1,
                  "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                  "name": "Wrapped Ether",
                  "symbol": "WETH",
                  "decimals": 18,
                  "coingeckoId": "weth",
                  "status": "approved",
                  "hide": false,
                  "canExchange": true,
                  "verified": true,
                  "updatedAt": "2022-10-20T22:07:31.682Z",
                  "createdAt": "2022-05-18T12:54:47.695Z",
                  "price": 1285.7,
                  "dailyVolume": 271291690.7628123,
                  "totalSupply": "4124756.609295726227361804",
                  "networkEnumValue": "ethereum",
                  "type": "base-token",
                  "network": "ethereum",
                  "balance": 0.17474029229976862,
                  "balanceRaw": "174740292299768611",
                  "balanceUSD": 224.6635938098125
                }
              ],
              "dataProps": {
                "liquidity": 828.5702561709628,
                "fee": 0.003,
                "volume": 0,
                "volumeChangePercentage": 0,
                "isBlocked": false
              },
              "displayProps": {
                "label": "FLOKIS / WETH",
                "secondaryLabel": "50% / 50%",
                "images": [
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xd8da6bf26964af9d7eed9e03e53415d37aa96045.png",
                  "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
                ],
                "statsItems": [
                  {
                    "label": "Liquidity",
                    "value": {
                      "type": "dollar",
                      "value": 828.5702561709628
                    }
                  },
                  {
                    "label": "Volume",
                    "value": {
                      "type": "dollar",
                      "value": 0
                    }
                  },
                  {
                    "label": "Fee",
                    "value": {
                      "type": "pct",
                      "value": 0.003
                    }
                  },
                  {
                    "label": "Ratio",
                    "value": "50% / 50%"
                  },
                  {
                    "label": "Share",
                    "value": {
                      "type": "pct",
                      "value": 54.22922006590992
                    }
                  }
                ]
              },
              "balance": 296200,
              "balanceRaw": "296200000000000000000000",
              "balanceUSD": 449.327187619625
            }
          ],
          "meta": []
        }
      ],
      "meta": [
        {
          "label": "Total",
          "value": 816.1127518401113,
          "type": "dollar"
        },
        {
          "label": "Assets",
          "value": 816.1127518401113,
          "type": "dollar"
        },
        {
          "label": "Debt",
          "value": 0,
          "type": "dollar"
        }
      ]
    }
  }
}
```

### `v2/apps/balances/supported`

Endpoint provides insight into what apps the wallet has investments in, and
metadata about those apps

Notes on use of the API and limits:

- Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance
- Any balance less than $0.01 USD value is not included in the output

Path

`v2/apps/{appId}/supported`

Parameters

- `addresses[]`: **(required)** | addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses

Returns

- `appId`: ID of the app
- `label`: App display name
- `img`: image used for the app's icon
- `tags`: tags associated with this app

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps/balances/supported?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
[
  {
    "network": "ethereum",
    "apps": [
      {
        "appId": "loopring",
        "meta": {
          "label": "Loopring",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/loopring.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "decentralized-exchange"
          ]
        }
      },
      {
        "appId": "reflexer",
        "meta": {
          "label": "Reflexer",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/reflexer.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "lending"
          ]
        }
      },
      {
        "appId": "sablier",
        "meta": {
          "label": "Sablier",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/sablier.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "payments"
          ]
        }
      },
      {
        "appId": "uniswap-v2",
        "meta": {
          "label": "Uniswap V2",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/uniswap-v2.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "liquidity-pool"
          ]
        }
      },
      {
        "appId": "aave-v2",
        "meta": {
          "label": "Aave V2",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "lending"
          ]
        }
      },
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "polygon",
    "apps": [
      {
        "appId": "superfluid",
        "meta": {
          "label": "Superfluid",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/superfluid.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "payments"
          ]
        }
      },
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "optimism",
    "apps": [
      {
        "appId": "velodrome",
        "meta": {
          "label": "Velodrome",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/velodrome.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "decentralized-exchange",
            "liquidity-pool"
          ]
        }
      },
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "arbitrum",
    "apps": [
      {
        "appId": "umami-finance",
        "meta": {
          "label": "Umami Finance",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/umami-finance.png",
          "supportedActions": [
            "view"
          ],
          "tags": [
            "fund-manager",
            "asset-management"
          ]
        }
      },
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "celo",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "moonriver",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "aurora",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "gnosis",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "binance-smart-chain",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "fantom",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "avalanche",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  },
  {
    "network": "bitcoin",
    "apps": [
      {
        "appId": "tokens",
        "meta": {
          "label": "Tokens",
          "img": "https://storage.googleapis.com/zapper-fi-assets/apps/tokens.png",
          "supportedActions": [
            "view"
          ],
          "tags": []
        }
      }
    ]
  }
]
```

## Apps queries

### `v2/apps/{appSlug}`

Provides metadata about a particular app, such as the networks it is available
on and what investment groupings (`groupIds`) are included within it

Path

`v2/apps/{appSlug}`

Parameters

- `appSlug`: **(required)** | app to get data for

Returns

- `Id`: ID of the app
- `name`: display name for app
- `description`: description of the app
- `groups`: groupings of different asset types, represented by groupIds, within the app
- `presentationConfig`: details on how to display the app's assets on the App's details page for Zapper's frontend
- `supportedNetworks`: Networks the app is available on
- `token`: Token associated with the app, if any
- `tags`: tags associated with this app
- `links`: relevant social links for the app and website

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps/aave-v3' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "id": "aave-v3",
  "tags": [
    "lending"
  ],
  "name": "Aave V3",
  "url": "https://aave.com/",
  "description": "Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers.",
  "groups": [
    {
      "id": "supply",
      "type": "token",
      "label": "Lending"
    },
    {
      "id": "stable-debt",
      "type": "token",
      "label": "Lending"
    },
    {
      "id": "variable-debt",
      "type": "token",
      "label": "Lending"
    },
    {
      "id": "claimable",
      "type": "token",
      "label": "Rewards",
      "isHiddenFromExplore": true
    }
  ],
  "presentationConfig": {
    "tabs": [
      {
        "label": "Lending",
        "viewType": "split",
        "views": [
          {
            "viewType": "list",
            "label": "Supply",
            "groupIds": [
              "supply"
            ]
          },
          {
            "viewType": "split",
            "label": "Borrow",
            "views": [
              {
                "viewType": "list",
                "label": "Variable",
                "groupIds": [
                  "variable-debt"
                ]
              },
              {
                "viewType": "list",
                "label": "Stable",
                "groupIds": [
                  "stable-debt"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "supportedNetworks": [
    {
      "network": "arbitrum",
      "actions": [
        "view"
      ]
    },
    {
      "network": "avalanche",
      "actions": [
        "view"
      ]
    },
    {
      "network": "fantom",
      "actions": [
        "view"
      ]
    },
    {
      "network": "harmony",
      "actions": [
        "view"
      ]
    },
    {
      "network": "optimism",
      "actions": [
        "view"
      ]
    },
    {
      "network": "polygon",
      "actions": [
        "view"
      ]
    }
  ],
  "primaryColor": "#1c1d26",
  "token": {
    "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    "network": "ethereum"
  },
  "compatibleAddressFormats": {
    "arbitrum": "evm",
    "avalanche": "evm",
    "fantom": "evm",
    "harmony": "evm",
    "optimism": "evm",
    "polygon": "evm"
  }
}
```

### `v2/apps`

Provides details on ALL apps listed on Zapper, including metadata. This will
return 100s of apps

Path

`v2/apps`

Parameters

None

Returns

- `Id`: ID of the app
- `name`: display name for app
- `description`: description of the app
- `groups`: groupings of different asset types, represented by groupIds, within the app
- `presentationConfig`: details on how to display the app's assets on the App's details page for Zapper's frontend
- `supportedNetworks`: Networks the app is available on
- `token`: Token associated with the app, if any
- `tags`: tags associated with this app
- `links`: relevant social links for the app and website

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
[
  {
    "id": "aave-amm",
    "tags": [
      "lending"
    ],
    "keywords": [],
    "name": "Aave AMM",
    "url": "https://aave.com/",
    "links": {
      "github": "https://github.com/aave",
      "twitter": "https://twitter.com/AaveAave",
      "discord": "https://discord.gg/CvKUrqM",
      "telegram": "https://t.me/Aavesome",
      "medium": "https://medium.com/aave"
    },
    "description": "Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers. The Aave AMM market enables liquidity providers (“LPs”) of Uniswap and Balancer to use their LP tokens as collateral in the Aave Protocol.",
    "groups": [
      {
        "type": "token",
        "id": "stable-debt",
        "label": "Lending",
        "isHiddenFromExplore": false
      },
      {
        "type": "token",
        "id": "supply",
        "label": "Lending",
        "isHiddenFromExplore": false
      },
      {
        "type": "token",
        "id": "variable-debt",
        "label": "Lending",
        "isHiddenFromExplore": false
      }
    ],
    "supportedNetworks": [
      {
        "network": "ethereum",
        "actions": [
          "view"
        ]
      }
    ],
    "primaryColor": "#1c1d26",
    "token": {
      "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      "network": "ethereum"
    },
    "compatibleAddressFormats": {
      "ethereum": "evm"
    }
  },
  {
    "id": "aave-safety-module",
    "tags": [
      "liquidity-pool"
    ],
    "keywords": [],
    "name": "Aave Safety Module",
    "url": "https://aave.com/",
    "links": {
      "github": "https://github.com/aave",
      "twitter": "https://twitter.com/AaveAave",
      "discord": "https://discord.gg/CvKUrqM",
      "telegram": "https://t.me/Aavesome",
      "medium": "https://medium.com/aave"
    },
    "description": "The Aave Safety Module incentivizes Aave governance token holders to lock away their liquidity. This liquidity is used as a mitigation tool in the case of a shortfall event within the money markets belonging to the Aave ecosystem.",
    "groups": [
      {
        "type": "token",
        "id": "abpt",
        "label": "ABPT",
        "isHiddenFromExplore": false
      },
      {
        "type": "token",
        "id": "stk-aave",
        "label": "stkAAVE",
        "isHiddenFromExplore": false
      },
      {
        "type": "token",
        "id": "stk-abpt",
        "label": "stkABPT",
        "isHiddenFromExplore": false
      },
      {
        "type": "contract-position",
        "id": "stk-aave-claimable",
        "label": "stkAAVE Rewards",
        "isHiddenFromExplore": false
      },
      {
        "type": "contract-position",
        "id": "stk-abpt-claimable",
        "label": "stkABPT Rewards",
        "isHiddenFromExplore": false
      }
    ],
    "supportedNetworks": [
      {
        "network": "ethereum",
        "actions": [
          "view"
        ]
      }
    ],
    "primaryColor": "#1c1d26",
    "token": {
      "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      "network": "ethereum"
    },
    "compatibleAddressFormats": {
      "ethereum": "evm"
    }
  },
  //.... you get the idea
```

### `v2/apps/{appId}/tokens`

Provides details on _app tokens_ held within a given app for a given `groupId`,
and the relevant data on them, such as supply, underlying tokens, APYs. This is
more detailed than the breakdown provided in `v2/apps` and `v2/apps/{appId}`, as
it includes data about the investments held within the app

:::info
Note that this query will only return data if the `groupId` is represented by app tokens. If you are not getting results, try the following query on `v2/apps/{appId}/positions`
:::

Path

`v2/apps/{appId}/tokens`

:::info
The shape of this response is a little different from `v2/apps/{appId}/positions`
:::

Parameters

- `appId`: **(required)** | id of the app
- `network`: **(required)** | network to query the app on
- `groupId`: **(required)** | investment within the app data that is desired for

Returns

- `appId`: ID of the app
- `network`: network the app is on
- `groupId`: group this particular investment belongs to within in the app, such as `pool` or `farms`
- `balance`: details on the balance structure, and what kind of balance it is
- `type`: type of position the investment is. `contract-position` is if the investment is held on a 3rd party contract. `app-token` is if the wallet holds tokens in the wallet representing the investment
- `address`: address of token
- `symbol`: symbol of token
- `decimals`: decimals of token
- `supply`: supply of token
- `price`: price of token
- `pricePerShare`: ratio of price to supply of assets
- `tokens`: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc
- `displayProps`: details on how to display the asset on Zapper's frontend
- `statsItems`: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps/aave-v3/tokens?network=avalanche&groupId=variable-debt' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
[
  {
    "type": "app-token",
    "address": "0x8619d80fb0141ba7f184cbf22fd724116d9f7ffc",
    "network": "avalanche",
    "appId": "aave-v3",
    "groupId": "variable-debt",
    "symbol": "variableDebtAvaDAI",
    "decimals": 18,
    "supply": 28728807.02194861,
    "price": 1.001,
    "pricePerShare": 1,
    "tokens": [
      {
        "id": "72",
        "networkId": 3,
        "address": "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
        "name": "Dai Stablecoin",
        "symbol": "DAI.e",
        "decimals": 18,
        "coingeckoId": "dai",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": true,
        "updatedAt": "2022-10-20T22:45:07.060Z",
        "createdAt": "2022-05-18T12:54:47.542Z",
        "price": 1.001,
        "dailyVolume": 198618113.26640192,
        "totalSupply": "97355482.086388692077440169",
        "networkEnumValue": "avalanche",
        "type": "base-token",
        "network": "avalanche"
      }
    ],
    "dataProps": {
      "apy": 0.022211509592724495,
      "liquidationThreshold": 0.8,
      "enabledAsCollateral": true,
      "liquidity": -28757535.828970555
    },
    "displayProps": {
      "label": "DAI.e",
      "secondaryLabel": {
        "type": "dollar",
        "value": 1.001
      },
      "tertiaryLabel": "2.221% APR (variable)",
      "images": [
        "https://storage.googleapis.com/zapper-fi-assets/tokens/avalanche/0xd586e7f844cea2f87f50152665bcbc2c279d8d70.png"
      ],
      "statsItems": [
        {
          "label": "Liquidity",
          "value": {
            "type": "dollar",
            "value": 28757535.828970555
          }
        },
        {
          "label": "APY",
          "value": {
            "type": "pct",
            "value": 2.2211509592724497
          }
        }
      ]
    }
  },
  {
    "type": "app-token",
    "address": "0x953a573793604af8d41f306feb8274190db4ae0e",
    "network": "avalanche",
    "appId": "aave-v3",
    "groupId": "variable-debt",
    "symbol": "variableDebtAvaLINK",
    "decimals": 18,
    "supply": 57145.68104628069,
    "price": 6.64,
    "pricePerShare": 1,
    "tokens": [
      {
        "id": "130",
        "networkId": 3,
        "address": "0x5947bb275c521040051d82396192181b413227a3",
        "name": "Chainlink Token",
        "symbol": "LINK.e",
        "decimals": 18,
        "coingeckoId": "chainlink",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": true,
        "updatedAt": "2022-10-20T22:45:07.060Z",
        "createdAt": "2022-05-18T12:54:47.542Z",
        "price": 6.64,
        "dailyVolume": 347318504.90975744,
        "totalSupply": "2575890.443630308010302757",
        "networkEnumValue": "avalanche",
        "type": "base-token",
        "network": "avalanche"
      }
    ],
    "dataProps": {
      "apy": 0.016443939840901187,
      "liquidationThreshold": 0.65,
      "enabledAsCollateral": true,
      "liquidity": -379447.3221473038
    },
    "displayProps": {
      "label": "LINK.e",
      "secondaryLabel": {
        "type": "dollar",
        "value": 6.64
      },
      "tertiaryLabel": "1.644% APR (variable)",
      "images": [
        "https://storage.googleapis.com/zapper-fi-assets/tokens/avalanche/0x5947bb275c521040051d82396192181b413227a3.png"
      ],
      "statsItems": [
        {
          "label": "Liquidity",
          "value": {
            "type": "dollar",
            "value": 379447.3221473038
          }
        },
        {
          "label": "APY",
          "value": {
            "type": "pct",
            "value": 1.6443939840901187
          }
        }
      ]
    }
  },
  {
    "type": "app-token",
    "address": "0xfccf3cabbe80101232d343252614b6a3ee81c989",
    "network": "avalanche",
    "appId": "aave-v3",
    "groupId": "variable-debt",
    "symbol": "variableDebtAvaUSDC",
    "decimals": 6,
    "supply": 246352370.988443,
    "price": 0.999904,
    "pricePerShare": 1,
    "tokens": [
      {
        "id": "202",
        "networkId": 3,
        "address": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        "name": "USD Coin",
        "symbol": "USDC",
        "decimals": 6,
        "coingeckoId": "usd-coin",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": true,
        "updatedAt": "2022-10-20T22:45:07.060Z",
        "createdAt": "2022-05-18T12:54:47.542Z",
        "price": 0.999904,
        "dailyVolume": 2529928266.4070354,
        "totalSupply": "854696118.34",
        "networkEnumValue": "avalanche",
        "type": "base-token",
        "network": "avalanche"
      }
    ],
    "dataProps": {
      "apy": 0.02028094269484669,
      "liquidationThreshold": 0.85,
      "enabledAsCollateral": true,
      "liquidity": -246328721.1608281
    },
    "displayProps": {
      "label": "USDC",
      "secondaryLabel": {
        "type": "dollar",
        "value": 0.999904
      },
      "tertiaryLabel": "2.028% APR (variable)",
      "images": [
        "https://storage.googleapis.com/zapper-fi-assets/tokens/avalanche/0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e.png"
      ],
      "statsItems": [
        {
          "label": "Liquidity",
          "value": {
            "type": "dollar",
            "value": 246328721.1608281
          }
        },
        {
          "label": "APY",
          "value": {
            "type": "pct",
            "value": 2.028094269484669
          }
        }
      ]
    }
  },
//...continued
```

### `v2/apps/{appId}/positions`

Provides details on _contract positions_ held within a given app for a given
`groupId`, and the relevant data on them, such as supply, underlying tokens,
APYs. This is more detailed than the breakdown provided in `v2/apps` and
`v2/apps/{appId}`, as it includes data about the investments held within the app
in a given `groupId`

:::info
Note that this query will only return data if the `groupId` is represented by contract positions. If you are not getting results, try the following query on `v2/apps/{appId}/tokens`
:::

Path

`v2/apps/{appId}/positions`

:::info
The shape of this response is a little different from `v2/apps/{appId}/tokens`
:::

Parameters

- `appId`: **(required)** | id of the app
- `network`: **(required)** | network to query the app on
- `groupId`: **(required)** | investment within the app data that is desired for

Returns

- `appId`: ID of the app
- `network`: network the app is on
- `groupId`: group this particular investment belongs to within in the app, such as `pool` or `farms`
- `balance`: details on the balance structure, and what kind of balance it is
- `type`: type of position the investment is. `contract-position` is if the investment is held on a 3rd party contract. `app-token` is if the wallet holds tokens in the wallet representing the investment
- `address`: address of token
- `symbol`: symbol of token
- `decimals`: decimals of token
- `supply`: supply of token
- `price`: price of token
- `pricePerShare`: ratio of price to supply of assets
- `tokens`: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc
- `displayProps`: details on how to display the asset on Zapper's frontend
- `statsItems`: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/apps/gmx/positions?network=arbitrum&groupId=farm' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
[
  {
    "type": "contract-position",
    "address": "0x908c4d94d34924765f1edc22a1dd098397c59dd4",
    "network": "arbitrum",
    "appId": "gmx",
    "groupId": "farm",
    "tokens": [
      {
        "metaType": "supplied",
        "id": "242",
        "networkId": 2,
        "address": "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
        "name": "GMX",
        "symbol": "GMX",
        "decimals": 18,
        "coingeckoId": "gmx",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": false,
        "updatedAt": "2022-10-20T22:54:03.055Z",
        "createdAt": "2022-05-18T12:54:47.549Z",
        "price": 33.18,
        "dailyVolume": 5366572.032678855,
        "totalSupply": "8658199.737761476990000001",
        "networkEnumValue": "arbitrum",
        "type": "base-token",
        "network": "arbitrum"
      },
      {
        "metaType": "claimable",
        "id": "291",
        "networkId": 2,
        "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "name": "Wrapped Ether",
        "symbol": "WETH",
        "decimals": 18,
        "coingeckoId": "weth",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": true,
        "updatedAt": "2022-10-20T22:54:03.055Z",
        "createdAt": "2022-05-18T12:54:47.549Z",
        "price": 1281.56,
        "dailyVolume": 553310851.945852,
        "totalSupply": "195637.587011069603978434",
        "networkEnumValue": "arbitrum",
        "type": "base-token",
        "network": "arbitrum"
      },
      {
        "metaType": "claimable",
        "type": "app-token",
        "address": "0xf42ae1d54fd613c9bb14810b0588faaa09a426ca",
        "appId": "gmx",
        "groupId": "es-gmx",
        "network": "arbitrum",
        "symbol": "esGMX",
        "decimals": 18,
        "supply": 2616647.922028693,
        "price": 33.18,
        "pricePerShare": 1,
        "tokens": [
          {
            "id": "242",
            "networkId": 2,
            "address": "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
            "name": "GMX",
            "symbol": "GMX",
            "decimals": 18,
            "coingeckoId": "gmx",
            "status": "approved",
            "hide": false,
            "canExchange": true,
            "verified": false,
            "updatedAt": "2022-10-20T22:52:31.297Z",
            "createdAt": "2022-05-18T12:54:47.549Z",
            "price": 33.18,
            "dailyVolume": 5366064.9493921995,
            "totalSupply": "8658199.737761476990000001",
            "networkEnumValue": "arbitrum",
            "type": "base-token",
            "network": "arbitrum"
          }
        ],
        "dataProps": {
          "liquidity": 86820378.05291203
        },
        "displayProps": {
          "label": "esGMX",
          "secondaryLabel": {
            "type": "dollar",
            "value": 33.18
          },
          "images": [
            "https://storage.googleapis.com/zapper-fi-assets/tokens/arbitrum/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.png"
          ]
        }
      }
    ],
    "dataProps": {
      "liquidity": 215551042.06164038,
      "isActive": true,
      "dailyROI": 0,
      "weeklyROI": 0,
      "yearlyROI": 0
    },
    "displayProps": {
      "label": "GMX",
      "secondaryLabel": {
        "type": "dollar",
        "value": 33.18
      },
      "images": [
        "https://storage.googleapis.com/zapper-fi-assets/tokens/arbitrum/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.png"
      ],
      "statsItems": [
        {
          "label": "APR",
          "value": {
            "type": "pct",
            "value": 0
          }
        },
        {
          "label": "Liquidity",
          "value": {
            "type": "dollar",
            "value": 215551042.06164038
          }
        }
      ]
    }
  },
  {
    "type": "contract-position",
    "address": "0x908c4d94d34924765f1edc22a1dd098397c59dd4",
    "network": "arbitrum",
    "appId": "gmx",
    "groupId": "farm",
    "tokens": [
      {
        "metaType": "supplied",
        "type": "app-token",
        "address": "0xf42ae1d54fd613c9bb14810b0588faaa09a426ca",
        "appId": "gmx",
        "groupId": "es-gmx",
        "network": "arbitrum",
        "symbol": "esGMX",
        "decimals": 18,
        "supply": 2616647.922028693,
        "price": 33.18,
        "pricePerShare": 1,
        "tokens": [
          {
            "id": "242",
            "networkId": 2,
            "address": "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
            "name": "GMX",
            "symbol": "GMX",
            "decimals": 18,
            "coingeckoId": "gmx",
            "status": "approved",
            "hide": false,
            "canExchange": true,
            "verified": false,
            "updatedAt": "2022-10-20T22:52:31.297Z",
            "createdAt": "2022-05-18T12:54:47.549Z",
            "price": 33.18,
            "dailyVolume": 5366064.9493921995,
            "totalSupply": "8658199.737761476990000001",
            "networkEnumValue": "arbitrum",
            "type": "base-token",
            "network": "arbitrum"
          }
        ],
        "dataProps": {
          "liquidity": 86820378.05291203
        },
        "displayProps": {
          "label": "esGMX",
          "secondaryLabel": {
            "type": "dollar",
            "value": 33.18
          },
          "images": [
            "https://storage.googleapis.com/zapper-fi-assets/tokens/arbitrum/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.png"
          ]
        }
      },
      {
        "metaType": "claimable",
        "id": "291",
        "networkId": 2,
        "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "name": "Wrapped Ether",
        "symbol": "WETH",
        "decimals": 18,
        "coingeckoId": "weth",
        "status": "approved",
        "hide": false,
        "canExchange": true,
        "verified": true,
        "updatedAt": "2022-10-20T22:54:03.055Z",
        "createdAt": "2022-05-18T12:54:47.549Z",
        "price": 1281.56,
        "dailyVolume": 553310851.945852,
        "totalSupply": "195637.587011069603978434",
        "networkEnumValue": "arbitrum",
        "type": "base-token",
        "network": "arbitrum"
      },
      {
        "metaType": "claimable",
        "type": "app-token",
        "address": "0xf42ae1d54fd613c9bb14810b0588faaa09a426ca",
        "appId": "gmx",
        "groupId": "es-gmx",
        "network": "arbitrum",
        "symbol": "esGMX",
        "decimals": 18,
        "supply": 2616647.922028693,
        "price": 33.18,
        "pricePerShare": 1,
        "tokens": [
          {
            "id": "242",
            "networkId": 2,
            "address": "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
            "name": "GMX",
            "symbol": "GMX",
            "decimals": 18,
            "coingeckoId": "gmx",
            "status": "approved",
            "hide": false,
            "canExchange": true,
            "verified": false,
            "updatedAt": "2022-10-20T22:52:31.297Z",
            "createdAt": "2022-05-18T12:54:47.549Z",
            "price": 33.18,
            "dailyVolume": 5366064.9493921995,
            "totalSupply": "8658199.737761476990000001",
            "networkEnumValue": "arbitrum",
            "type": "base-token",
            "network": "arbitrum"
          }
        ],
        "dataProps": {
          "liquidity": 86820378.05291203
        },
        "displayProps": {
          "label": "esGMX",
          "secondaryLabel": {
            "type": "dollar",
            "value": 33.18
          },
          "images": [
            "https://storage.googleapis.com/zapper-fi-assets/tokens/arbitrum/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.png"
          ]
        }
      }
    ],
    "dataProps": {
      "liquidity": 54802415.124685735,
      "isActive": true,
      "dailyROI": 0,
      "weeklyROI": 0,
      "yearlyROI": 0
    },
    "displayProps": {
      "label": "esGMX",
      "secondaryLabel": {
        "type": "dollar",
        "value": 33.18
      },
      "images": [
        "https://storage.googleapis.com/zapper-fi-assets/tokens/arbitrum/0xf42ae1d54fd613c9bb14810b0588faaa09a426ca.png"
      ],
      "statsItems": [
        {
          "label": "APR",
          "value": {
            "type": "pct",
            "value": 0
          }
        },
        {
          "label": "Liquidity",
          "value": {
            "type": "dollar",
            "value": 54802415.124685735
          }
        }
      ]
    }
  },
//... continued
```

## NFT queries

### `v2/nft/balances/net-worth`

Provides the value of a wallet, or set of wallets, NFT portfolio, according to
Zapper's price estimation.

Path

`v2/nft/balances/net-worth`

Parameters

- `addresses`: **(required)** | input addresses to get net worth for (maximum of 15)

Returns

Estimated net worth in USD of all the wallet's NFTs

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/balances/net-worth?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "65415.9656178"
}
```

### `v2/nft/user/tokens`

Provides detailed breakdown of all _individual NFTs_ owned in a given wallet, including NFT metadata, collection metadata, estimated value for the NFT, last sale price, rarity, etc.

This endpoint is the right one to query if you want to get **ALL** NFTs in a given wallet. Each page returns 100 NFTs as its maximum number, which is generally enough to capture all NFTs in ~90% of all wallets. If you need to get all NFTs in a wallet that has greater than 100 NFTs, you will need to use the `cursor` to paginate through the list.

This endpoint differs from [`v2/nft/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftbalancestokens) in that it does not return an ordered list of NFTs by USD value, and it allows 100 per page versus 25 per page in `v2/nft/balances/tokens`, and this NFT endpoint is much more performant.

Path

`v2/nft/user/tokens`

Parameters

- `userAddress`: **(required)** | Input a single address. This endpoint does not allow an input of an array, unlike other endpoints form Zapper, due to how we index our data for this query.
- `network`: Returns only NFTs from network provided. If not provided, NFTs across all supported chains for NFTs will be returned
- `limit`: Maximum items to return. Limited to 100 maximum. Note that the default value is limit=50
- `cursor`: Cursor used to paginate the results, if more than 100 NFTs are returned in the response

Returns

- `balance`: number of NFTs owned of a given type. If it's ERC_721, it will always be 1. If NFT is is ERC_1155, will be a count of how many NFTs are owned by this wallet
- `token`: contains details relating to this NFT, such as price and metadata
  - `id`: internal Zapper ID number for token
  - `name`: name of NFT
  - `tokenId`: ID of token within collection
  - `lastSaleEth`: price of last sale of this NFT
  - `rarityRank`: rank of this NFTs rarity, based on traits, within its collection
  - `estimatedValueEth`: estimated value of this NFT, based on various signals using Zapper's internal model
  - `medias`: link to image for NFT
- `collection`: object containing details about the collection the NFT is in
  - `address`: collection address
  - `network`: network collection is on
  - `name`: name of collection
  - `nftStandard`: standard of the NFT (ERC-1155 or ERC-721)
  - `type`: categorization of the collection
    - `GENERAL`: general NFT collection
    - `BRIDGED`: bridged NFTs from a different chain
    - `BADGE`: badge, POAPs and similar collections
    - `TICKET`: for event ticket or similar collections
    - `ACCOUNT_BOUND`: also known as "soul bound NFTs"; these NFTs are not tradable
    - `WRITING`: writing collections (Mirror, Medium...)
    - `GAMING`: gaming related NFTs
    - `ART_BLOCKS`: Art blocks projects. Multiple collections in one contract
  - `floorPriceEth`: floor price of collection in eth
  - `logoImageURL`: URL for logo of collection
  - `openseaId`: ID of collection on OpenSea

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/user/tokens?userAddress=0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459&limit=100' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
{
 {
    "items": [
        {
            "balance": "1",
            "token": {
                "id": "49788045",
                "name": "Sedan",
                "tokenId": "33",
                "lastSaleEth": "0.25",
                "rarityRank": 119,
                "estimatedValueEth": "0.4364643958709034",
                "medias": [
                    {
                        "type": "image",
                        "originalUrl": "https://cryptomotors.io/images/full_vehicle_body/sedan_00_7_1_1.png"
                    }
                ],
                "collection": {
                    "address": "0x30a2fa3c93fb9f93d1efeffd350c6a6bb62ba000",
                    "network": "ethereum",
                    "name": "CryptoMotors",
                    "nftStandard": "erc721",
                    "type": "general",
                    "floorPriceEth": "0.48",
                    "logoImageUrl": "https://storage.googleapis.com/zapper-fi-assets/nft/0x30a2fa3c93fb9f93d1efeffd350c6a6bb62ba000/unnamed25.png",
                    "openseaId": "cryptomotors"
                }
            }
        },
  ...
  "cursor": "MC4xNzUtMS02Njg2NzAzMA=="
}
```

### `v2/nft/balances/tokens`

Provides detailed breakdown of all _individual NFTs_ owned in a given wallet, including NFT metadata, collection metadata, estimated value for the NFT, last sale price, rarity, etc. The values returned in this endpoint are **ORDERED** by descending estimatedUSD value. So, the 25 NFTs returned on the first page will be the 25 highest value NFTs in the wallet's portfolio.

[If you are looking to ingest ALL NFTs held in a given wallet, you should use the endpoint `v2/nft/user/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftusertokens) instead.

:::info
The response is paginated, with a maximum number of 25 per response. You will need to parse through different pages, using `cursor` to get values beyond the initial 25 NFT response.
:::

Path

`v2/nft/balances/tokens`

Parameters

- `addresses`: **(required)** | input addresses to get net worth for (maximum of 15)
- `minCollectionValueUsd`: Returns only collections with an estimated value above the amount inputted
- `search`: Returns only collections with name starting with inputted string
- `collectionAddresses[]`: Returns only collections provided
- `network`: Returns only NFTs from network provided
- `limit`: Maximum items to return. Limited to 25 maximum
- `cursor`: Cursor used to paginate the results

Returns

- `token`: object containing details about the individual NFT
  - `balance`: number of NFTs owned of a given type. If it's ERC_721, it will always be 1. If NFT is is ERC_1155, will be a count of how many NFTs are owned by this wallet
  - `name`: name of NFT
  - `tokenId`: ID of token within collection
  - `lastSaleEth`: price of last sale of this NFT
  - `rarityRank`: rank of this NFTs rarity, based on traits, within its collection
  - `estimatedValueEth`: estimated value of this NFT, based on various signals using Zapper's internal model
  - `medias`: link to image for NFT
- `collection`: object containing details about the collection the NFT is a part of
  - `address`: collection address
  - `network`: network collection is on
  - `name`: name of collection
  - `nftStandard`: standard of the NFT (1155 or 721)
  - `floorPriceEth`: floor price of collection in eth
  - `logoImageURL`: URL for logo of collection
  - `openseaId`: ID of collection on OpenSea

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/balances/tokens?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&collectionAddresses%5B%5D=0x47b648edd37aeae4f16d153451fd1784c1dd19a5&limit=25' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "items": [
    {
      "balance": "1000",
      "token": {
        "name": "McHooty's Backdoor",
        "tokenId": "1",
        "lastSaleEth": "0.03",
        "rarityRank": null,
        "estimatedValueEth": "0.02",
        "medias": [
          {
            "type": "image",
            "originalUrl": "https://arweave.net/lRqoxOz0P1fBTyxpkjYaL78q6AHoz5X7iGiA14oO6wQ"
          }
        ],
        "collection": {
          "address": "0x47b648edd37aeae4f16d153451fd1784c1dd19a5",
          "network": "ethereum",
          "name": "Mchooty's",
          "nftStandard": "erc1155",
          "floorPriceEth": "0.04",
          "logoImageUrl": "https://openseauserdata.com/files/fc1b139d066893c6a9390fb8c9612668.png",
          "openseaId": "mchootys-dao"
        }
      }
    },
    {
      "balance": "1",
      "token": {
        "name": "Primordial",
        "tokenId": "189",
        "lastSaleEth": "5.3",
        "rarityRank": null,
        "estimatedValueEth": "5.3",
        "medias": [
          {
            "type": "image",
            "originalUrl": "https://edda-cdn.fra1.cdn.digitaloceanspaces.com/collection1/189.mp4"
          }
        ],
        "collection": {
          "address": "0x97c548ac36d5a218bef504b5d5389b724355c5af",
          "network": "ethereum",
          "name": "EDDA NFT",
          "nftStandard": "erc1155",
          "floorPriceEth": "0.098",
          "logoImageUrl": null,
          "openseaId": "eddaswap"
        }
      }
    }
    ...
  "cursor": "MC4xNzUtMS02Njg2NzAzMA=="
}
```

### `v2/nft/balances/collections`

Provides detailed breakdown of all collections owned in a given wallet, including collection metadata, estimated price for all NFTs owned in that collection, and trading volume for that collection in a given time period

:::info
The response is paginated, with a maximum number of 25 per response. You will need to parse through different pages, using `cursor` to get values beyond the initial 25
:::

Path

`v2/nft/balances/collections`

Parameters

- `addresses`: **(required)** | input addresses to get net worth for (maximum of 15)
- `minCollectionValueUsd`: Returns only collections with an estimated value above the amount inputted
- `search`: Returns only collections with name starting with inputted string
- `collectionAddresses[]`: Returns only collections provided
- `network`: Returns only NFTs from network provided
- `limit`: Maximum items to return. Limited to 25 maximum
- `cursor`: Cursor used to paginate the results

Returns

- `balance`: number of NFTs owned in the collection
- `balanceUSD`: estimated value of all the NFTs owned in the collection
- `name`: name of collection
- `network`: network of the collection
- `description`: description of the collection
- `logoImageUrl`: URL for logo image
- `cardImageUrl`: URL for card image
- `bannerImageUrl`: URL for banner image
- `nftStandard`: standard of the NFT (1155 or 721)
- `floorPriceEth`: floor price of collection in eth. Floor price is pulled from multiple platforms via Reservoir and the displayed floor price is the lowest aggregated value. [https://docs.reservoir.tools/docs/aggregated-orderbook](https://docs.reservoir.tools/docs/aggregated-orderbook)
- `marketCap`: market cap of the collection in eth
- `openseaId`: ID of collection on OpenSea
- `socialLinks`: links to various socials
- `stats`: stats on hourly/daily/weekly/total volume in eth for the collection

cURL

```ks
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/balances/collections?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&limit=25' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "items": [
    {
      "balance": "1001",
      "balanceUSD": "25632.8",
      "collection": {
        "name": "Mchooty's",
        "network": "ethereum",
        "description": "McHooty’s Community DAO is dedicated to providing long term strategic value and growth for the dirtbird and greater web3 communities.\n\nVoting rights in the DAO are a function of owning McHooty’s dynamic tokens.\n\nThe core team is comprised of talented specialists who believe in bringing value back to creatives.\n\nfollow @McHootys_wtf to learn more.",
        "logoImageUrl": "https://openseauserdata.com/files/fc1b139d066893c6a9390fb8c9612668.png",
        "cardImageUrl": "https://openseauserdata.com/files/dbe9e0cca1a47ec5c5cbb2c6aed634b2.gif",
        "bannerImageUrl": "https://openseauserdata.com/files/edf89b63791c34bbd71962ed21eaf5ee.png",
        "nftStandard": "erc1155",
        "floorPriceEth": "0.04",
        "marketCap": "65.4",
        "openseaId": "mchootys-dao",
        "socialLinks": [
          {
            "name": "opensea",
            "label": "Opensea",
            "url": "https://opensea.io/collection/mchootys-dao",
            "logoUrl": "https://storage.googleapis.com/zapper-fi-assets/logos/opensea.png"
          },
          {
            "name": "website",
            "label": "Website",
            "url": "http://mchootys.wtf",
            "logoUrl": "https://storage.googleapis.com/zapper-fi-assets/logos/website.png"
          },
          {
            "name": "twitter",
            "label": "Twitter",
            "url": "https://twitter.com/Mchootys_wtf",
            "logoUrl": "https://storage.googleapis.com/zapper-fi-assets/logos/twitter.png"
          }
        ],
        "stats": {
          "hourlyVolumeEth": "0",
          "hourlyVolumeEthPercentChange": null,
          "dailyVolumeEth": "0",
          "dailyVolumeEthPercentChange": null,
          "weeklyVolumeEth": "0.03",
          "weeklyVolumeEthPercentChange": null,
          "monthlyVolumeEth": "0.03",
          "monthlyVolumeEthPercentChange": null,
          "totalVolumeEth": "1.7700000000000005"
        }
      }
    },
    {
      "balance": "1",
      "balanceUSD": "6792.692",
      "collection": {
        "name": "EDDA NFT",
        "network": "ethereum",
        "description": "EDDASwap is an ecosystem of NFT and DeFi Applications. Hold $EDDA and farm EDDASwap’s exclusive NFTs or become a liquidity provider and stake your LP Tokens for even more exclusive NFTs. Farm from a specially curated collection created by leading motion graphic, 3D and digital artists. Welcome to the world of crypto collectibles. Let's Tokenize the world",
        "logoImageUrl": null,
        "cardImageUrl": null,
        "bannerImageUrl": null,
        "nftStandard": "erc1155",
        "floorPriceEth": "0.098",
        "marketCap": "164.444",
        "openseaId": "eddaswap",
        "socialLinks": [
          {
            "name": "website",
            "label": "Website",
            "url": "https://app.eddaswap.com/nft",
            "logoUrl": "https://storage.googleapis.com/zapper-fi-assets/logos/website.png"
          }
        ],
        "stats": {
          "hourlyVolumeEth": "0",
          "hourlyVolumeEthPercentChange": null,
          "dailyVolumeEth": "0",
          "dailyVolumeEthPercentChange": null,
          "weeklyVolumeEth": "0",
          "weeklyVolumeEthPercentChange": null,
          "monthlyVolumeEth": "0",
          "monthlyVolumeEthPercentChange": null,
          "totalVolumeEth": "151.934"
        }
      }
    }
    ....
  "cursor": "MC4xNzUtMTgwMTA="
}
```

### `v2/nft/balances/collections-totals`

Provides a simple value returned for the total count of collections in the wallet, the estimated value of them.

Differs from [`v2/nft/balances/net-worth`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftbalancesnet-worth) as you can scope down the NFTs you want the value for in the wallet

Path

`v2/nft/balances/collections-totals`

Parameters

- `addresses`: **(required)** | input addresses to get net worth for (maximum of 15)
- `minCollectionValueUsd`: Returns only collections with an estimated value above the amount inputted
- `search`: Returns only collections with name starting with inputted string
- `collectionAddresses[]`: Returns only collections provided
- `network`: Returns only NFTs from network provided

Returns

- `count`: number of collections owned by the wallet
- `balanceUSD`: estimated value of all the NFTs owned in the wallet

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/balances/collections-totals?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "count": "153",
  "balanceUSD": "65360.3215647"
}
```

### `v2/nft/balances/tokens-totals`

Provides a simple value returned for the total count of NFTs in the wallet, the
estimated value of them.

Differs from `v2/nft/balances/collections-total` as it is at the NFT level for
the counts.

Path

`v2/nft/balances/tokens-totals`

Parameters

- `addresses`: **(required)** | input addresses to get net worth for (maximum of 15)
- `minCollectionValueUsd`: Returns only collections with an estimated value above the amount inputted
- `search`: Returns only collections with name starting with inputted string
- `collectionAddresses[]`: Returns only collections provided
- `network`: Returns only NFTs from network provided

Returns

- `count`: number of NFTs owned, where ERC_1155 NFTs count as 1 per collection
- `totalCount`: number of NFTs owned, where ERC_1155 NFTs count as 1 per NFT held
- `balanceUSD`: estimated value of all the NFTs owned in the wallet

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/nft/balances/tokens-totals?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "count": "917",
  "totalCount": "1956",
  "balanceUSD": "65368.999995"
}
```

## Exchange queries

### `v2/exchange/price`

Returns data about the amount received if a trade would be made. Should be called whenever a price needs to be calculated.

Path

`v2/exchange/price`

Parameters

- `gasPrice`: Gas price (wei)
- `maxFeePerGas`: Max gas fee (wei)
- `maxPriorityFeePerGas`: Max priority gas fee (wei)
- `sellTokenAddress`: Address of the token that is being sold
- `buyTokenAddress`: Address of the token that is being bought
- `sellAmount`: Amount to sell
- `buyAmount`: Amount to buy
- `ownerAddress`: Address of the owner
- `slippagePercentage`: Slippage percentage as a decimal value
- `network`: Network where the swap would be made

Returns

- `price`: Price of the sell token
- `value`: Token value assouciated with price
- `gas`: Gas limit of the transaction
- `estimatedGas`: Gas required for the transaction
- `gasPrice`: Gas price at the time of transaction
- `maxPriorityFeePerGas`: Maximum priority fee for gas in this speed tier
- `maxFeePerGas`: Max fee for gas in this gas speed tier
- `buyTokenAddress`: Token address for the token wanting to buy
- `sellTokenAddress`: Token address for the token wanting to sell
- `buyAmount`: Total quantity of buy token
- `sellAmount`: Total quantity of sell token
- `allowanceTarget`: Token address of token that is approved to sell
- `sources`: liquidity sources
  - `name`: Source of swap route
  - `proportion`: Proportion of tokens swapped by this source
  - `displayName`: Display name of source
  - `symbol`: Symbol of source
  - `hops`: Number of hops needed for swap
- `zapperFee`: Percentage of fees from swap

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/exchange/price?sellTokenAddress=0x0000000000000000000000000000000000000000&buyTokenAddress=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&sellAmount=1000000000000000000&ownerAddress=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&slippagePercentage=0.03&network=ethereum' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "price": "1626.154659",
  "value": "1000000000000000000",
  "gas": "265203",
  "estimatedGas": "265203",
  "gasPrice": "35000000000",
  "maxPriorityFeePerGas": "1000000000",
  "maxFeePerGas": "29000000000",
  "buyTokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "sellTokenAddress": "0x0000000000000000000000000000000000000000",
  "buyAmount": "1626194089",
  "sellAmount": "1000000000000000000",
  "allowanceTarget": "0x0000000000000000000000000000000000000000",
  "sources": [
    {
      "name": "Uniswap_V3",
      "proportion": 1,
      "displayName": "Uniswap V3",
      "symbol": "uniswap-v3",
      "hops": []
    }
  ],
  "zapperFee": 0.005
}
```

### `v2/exchange/quote`

Returns both the relative price for a trade as well as the call data used to
submit a transaction for a trade. Should only be called when a trade is ready to
be submitted.

Path

`v2/exchange/quote`

Parameters

- `gasPrice`: Gas price (wei)
- `maxFeePerGas`: Max gas fee (wei)
- `maxPriorityFeePerGas`: Max priority gas fee (wei)
- `sellTokenAddress`: Address of the token that is being sold
- `buyTokenAddress`: Address of the token that is being bought
- `sellAmount`: Amount to sell
- `buyAmount`: Amount to buy
- `ownerAddress`: Address of the owner
- `slippagePercentage`: Slippage percentage as a decimal value
- `network`: Network where the swap would be made

Returns

- `price`: Sell token price divided by buy token price
- `data`: Transactional data for swap
- `to`: Address that tokens are transferred to
- `value`: Quantity of native network token being transferred
- `estimatedGas`: Address of the token that is being bought
- `maxPriorityFeePerGas`: Maximum priority fee for gas in this speed tier
- `maxFeePerGas`: Max fee for gas in this gas speed tier
- `buyTokenAddress`: Token address for the token wanting to buy
- `sellTokenAddress`: Token address for the token wanting to sell
- `buyAmount`: Total quantity of buy token
- `sellAmount`: Total quantity of sell token
- `allowanceTarget`: Token address of token that is approved to sell
- `sources`: sources of liqudiity
  - `name`: source of swap route
  - `proportion`: proportion of tokens swapped by this source
  - `displayName`: display name of source
  - `symbol`: symbol of source
  - `hops`: number of hops needed for swap
- `zapperFee`: percentage of fees from swap

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/exchange/quote?gasPrice=35000000000&maxFeePerGas=40000000000&maxPriorityFeePerGas=1000000000&sellTokenAddress=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&buyTokenAddress=0x0000000000000000000000000000000000000000&sellAmount=1000000&ownerAddress=0xe321bd63cde8ea046b382f82964575f2a5586474&slippagePercentage=0.03&network=ethereum' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
{
  "price": "0.000824318884007021",
  "data": "0x415565b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000002d7217cd6e6d700000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000004c000000000000000000000000000000000000000000000000000000000000005c0000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000025375736869537761700000000000000000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000002dac437104bd5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000003a2ba3964fe00000000000000000000000043a2a720cd0911690c248075f4a29a5e7716f758000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000000869584cd0000000000000000000000003ce37278de6388532c3949ce4e886f365b14fb5600000000000000000000000000000000000000000000005c32bfbad3637698a8",
  "to": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "value": "0",
  "estimatedGas": "339874",
  "gasPrice": "35000000000",
  "maxPriorityFeePerGas": "1000000000",
  "maxFeePerGas": "40000000000",
  "buyTokenAddress": "0x0000000000000000000000000000000000000000",
  "sellTokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "buyAmount": "824338871226566",
  "sellAmount": "1000000",
  "allowanceTarget": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "sources": [
    {
      "name": "SushiSwap",
      "proportion": 1,
      "displayName": "SushiSwap",
      "symbol": "sushiswap",
      "hops": []
    }
  ],
  "gas": "339874",
  "zapperFee": 0.005
}
```

### `v2/exchange/supported`

Returns the exchanges supported by Zapper API.

Path

`v2/exchange/supported`

Parameters

None

Returns

- `network`: network name available for swaps
- `label`: label of network
- `numTokens`: number of tokens available to be swapped on that network

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/exchange/supported' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```json
[
  {
    "network": "arbitrum",
    "label": "Arbitrum",
    "numTokens": 62
  },
  {
    "network": "avalanche",
    "label": "Avalanche",
    "numTokens": 112
  },
  {
    "network": "binance-smart-chain",
    "label": "BSC",
    "numTokens": 488
  },
  {
    "network": "ethereum",
    "label": "Ethereum",
    "numTokens": 1215
  },
  {
    "network": "fantom",
    "label": "Fantom",
    "numTokens": 119
  },
  {
    "network": "optimism",
    "label": "Optimism",
    "numTokens": 36
  },
  {
    "network": "polygon",
    "label": "Polygon",
    "numTokens": 244
  }
]
```

## Miscellaneous Data Endpoints

### `v2/prices`

Retrieve supported tokens and their prices. Generally populated by data from
CoinGecko

Path

`v2/prices`

Parameters

- `network`: retrieve tokens for this specified network

Returns

- `id`: internal token id
- `networkId`: internal network id
- `address`: token's address
- `name`: label for token
- `symbol`: symbol for token
- `decimals`: decimals for token
- `coingeckoId`: coingecko API id for token
- `status`: internal designation if token has been initially reviewed when ingested
- `hide`: internal designation if token is approved for displaying
- `canExchange`: flag if this token is exchangeable on Zapper's front end
- `verified`: if token is on a verified token list, and has a blue-checkmark on Zapper's frontend
- `updatedAt`: last date token was updated from CoinGecko
- `createdAt`: date token was first ingested
- `price`: current price of token in USD
- `dailyVolume`: trading volume of token from coingecko
- `totalSupply`: total supply of token available
- `networkEnumValue`: network token is on
- `type`: designation if the token is a base-token or app-token (meaning the token is associated with an app's investment)
- `network`: label of network token is on

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/prices?network=optimism' \
  -H 'accept: */*' \1
  -H 'Authorization: Basic asdadsadada12341=='
```

Response

```json
[
  {
    "id": "94",
    "networkId": 11,
    "address": "0x296f55f8fb28e498b858d0bcda06d955b2cb3f97",
    "name": "StargateToken",
    "symbol": "STG",
    "decimals": 18,
    "coingeckoId": "stargate-finance",
    "status": "approved",
    "hide": false,
    "canExchange": true,
    "verified": false,
    "updatedAt": "2022-10-20T23:54:02.228Z",
    "createdAt": "2022-05-18T12:54:47.542Z",
    "price": 0.438465,
    "dailyVolume": 6546463.232311093,
    "totalSupply": "7698057.755052034171408426",
    "networkEnumValue": "optimism",
    "type": "base-token",
    "network": "optimism"
  },
  {
    "id": "13541517",
    "networkId": 11,
    "address": "0x3e7ef8f50246f725885102e8238cbba33f276747",
    "name": "BarnBridge Governance Token (Optimism)",
    "symbol": "BOND",
    "decimals": 18,
    "coingeckoId": "barnbridge",
    "status": "approved",
    "hide": false,
    "canExchange": true,
    "verified": true,
    "updatedAt": "2022-10-20T23:54:02.228Z",
    "createdAt": "2022-09-08T16:00:07.542Z",
    "price": 4.84,
    "dailyVolume": 10497007.061096925,
    "totalSupply": "58976.543282950370221951",
    "networkEnumValue": "optimism",
    "type": "base-token",
    "network": "optimism"
  }
//...
]
```

### `v2/gas-prices`

Retrieve supported tokens and their prices across many currencies

Path

`v2/gas-prices`

Parameters

- `network`: Retrieve gas prices for this network
- `eip1559`: **(required)** | boolean flag for Retrieve post London gas price details

Returns

- `eip1559`: coingecko API id for token
- `baseFeePerGas`: base fee for gas in this gas speed tier
- `maxPriorityFeePerGas`: maximum priority fee for gas in this speed tier
- `maxFeePerGas`: max fee for gas in this gas speed tier

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v2/gas-prices?network=ethereum&eip1559=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic asdadsadada12341=='
```

Response

```json
{
  "eip1559": true,
  "standard": {
    "baseFeePerGas": 23,
    "maxPriorityFeePerGas": 1,
    "maxFeePerGas": 35
  },
  "fast": {
    "baseFeePerGas": 23,
    "maxPriorityFeePerGas": 1,
    "maxFeePerGas": 35
  },
  "instant": {
    "baseFeePerGas": 24,
    "maxPriorityFeePerGas": 1,
    "maxFeePerGas": 36
  }
}
```

### `v1/api-clients/points`

Endpoint returns how many API points are remaining in your API account. Your balance of API points is funded at the beginning of each month with 10,000 free points or by additional API point purchases.

Notes on how points work

- If you have multiple API keys issued to you, they all pull points from the same pot; API points are not on a per-key basis, but at a business-entity level. So, all your API keys will return the same `pointsRemaining` value, as they share the same pot of points.
- `pointsRemaining` is calculated and evaluated every ~1 hour. This endpoint is not real-time

Path

`v1/api-clients/points`

Parameters

No parameters; your API key is authorized via your header, so points can only be returned for your API key

Returns

- `pointsRemaining`: how many points your API account has remaining before being turned off due to a negative points balance

cURL

```js
cURL -X 'GET' \
  'https://api.zapper.xyz/v1/api-clients/points' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

Response

```JSON
{
   "pointsRemaining": "19962"
}
```
