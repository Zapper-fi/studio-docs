---
sidebar_position: 4
---

# API Schema

See below for details on each of Zapper's API endpoints. [Swagger docs to test these endpoints can be found here.](<https://api.zapper.fi/api/static/index.html#>)

# Balances endpoints

## `v2/balances` 
The `v2/balances` endpoint is the most powerful of those offered by Zapper. You input wallet addresses and get all the following:
<ul>
  <li>All tokens the wallet owns, by network, valued in USD</li>
  <li>Detailed breakdown of all app investment positions represented as app tokens owned by the wallet, such as Aave lending positions or Uniswap pools, valued in USD</li>
  <li>Detailed breakdown of all app investment positions represented as contract positions that are not held on the wallet, such ve-locked or farming positions, valued in USD</li>
</ul>

Notes on use of the API and limits:
<ul>
  <li>Maximum of 30 RPM (requests per minute)</li>
  <li>Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance</li>
  <li>Any balance less than $0.01 USD value is not included in the output</li>
</ul>

### Path
`v2/balances`


### Response format
The response is in JSON, but is streamed from our endpoint. You will need to understand how to handle streamed responses. [See our documentation on SSE handling here](<https://studio.zapper.fi/docs/apis/balance-v2-sse>).

### Parameters 
<ul>
  <li><code>addresses[]</code>: *(required)* Addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses</li>
  <li><code>networks[]</code>: Networks for which to retrieve balances, inputted an array. Available values : ethereum, polygon, optimism, gnosis, binance-smart-chain, fantom, avalanche, arbitrum, celo, moonriver, bitcoin, cronos, aurora</li>
  <li><code>bundled</code>: Set to false to receive balance individually for each addresses, instead of bundled together</li>
</ul>

### Return 
<ul>
  <li><code>appId</code>: ID of the app</li>
  <li><code>network</code>: network the app is on</li>
  <li><code>addresses</code>: addresses queried for</li>
  <li><code>balance</code>: details on the balance structure, and what kind of balance it is</li>
  <li><code>type</code>: type of position the investment is. <code>contract-position</code> is if the investment is held on a 3rd party contract</li>
  <li><code>app-token</code>: is if the wallet holds tokens in the wallet representing the investment</li>
  <li><code>displayProps</code>: details on how to display the asset on Zapper's frontend</li>
</ul>


### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/balances?addresses%5B%5D=0x3d280fde2ddb59323c891cf30995e1862510342f&bundled=false' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
event: balance
data: {"appId":"sudoswap","network":"ethereum","addresses":["0x3d280fde2ddb59323c891cf30995e1862510342f"],"balance":{"deposits":{},"debt":{},"vesting":{},"wallet":{},"claimable":{},"locked":{},"nft":{}},"totals":[{"key":"2987028053","type":"contract-position","network":"ethereum","balanceUSD":7256.5594200000005}],"errors":[],"app":{"appId":"sudoswap","network":"ethereum","data":[{"key":"2987028053","type":"position","appId":"sudoswap","address":"0xea504f1857707c6c875cba618a33bd09fc4aefac","metaType":null,"balanceUSD":7256.5594200000005,"contractType":"contract-position","network":"ethereum","displayProps":{"label":"Chain Runners ↔ ETH - Price: 0.22Ξ","secondaryLabel":null,"tertiaryLabel":null,"images":["https://lh3.googleusercontent.com/3vScLGUcTB7yhItRYXuAFcPGFNJ3kgO0mXeUSUfEMBjGkGPKz__smtXyUlRxzZjr1Y5x8hz1QXoBQSEb8wm4oBByeQC_8WOCaDON4Go=s120","https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0000000000000000000000000000000000000000.png"],"stats":[],"info":[{"label":{"type":"string","value":"App"},"value":{"type":"string","value":"Sudoswap"}}],"balanceDisplayMode":"default"},"breakdown":[{"key":"917389808","appId":"nft","address":"0x97597002980134bea46250aa0510c9b90d87a587","network":"ethereum","balanceUSD":7256.5594200000005,"metaType":"supplied","type":"nft","contractType":"non-fungible-token","breakdown":[],"assets":[{"tokenId":"1976","assetImg":"https://web.zapper.fi/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F1976&width=250&checksum=6f122","assetName":"Chain Runners #1976","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"2835","assetImg":"https://web.zapper.fi/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F2835&width=250&checksum=f4896","assetName":"Chain Runners #2835","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"3067","assetImg":"https://web.zapper.fi/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F3067&width=250&checksum=d3ddb","assetName":"Chain Runners #3067","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"3094","assetImg":"https://web.zapper.fi/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F3094&width=250&checksum=83db0","assetName":"Chain Runners #3094","balance":1,"balanceUSD":219.89574000000002},{"tokenId":"4605","assetImg":"https://web.zapper.fi/images/?url=https%3A%2F%2Fimg.chainrunners.xyz%2Fapi%2Fv1%2Ftokens%2Fpng%2F4605&width=250&checksum=93684","assetName":"Chain Runners #4605","balance":1,"balanceUSD":219.89574000000002}],"context":{"incomplete":true,"openseaId":"18242","holdersCount":3341,"floorPrice":0.171,"amountHeld":33,"volume24h":0,"volume7d":0,"volume1m":0},"displayProps":{"label":"RUN","secondaryLabel":{"type":"linkVersion","value":2},"tertiaryLabel":null,"profileImage":"https://lh3.googleusercontent.com/3vScLGUcTB7yhItRYXuAFcPGFNJ3kgO0mXeUSUfEMBjGkGPKz__smtXyUlRxzZjr1Y5x8hz1QXoBQSEb8wm4oBByeQC_8WOCaDON4Go=s120","profileBanner":"https://lh3.googleusercontent.com/8MKiOEUA3COVcXKzhj54Q5eP0GP9NDOFsumbkiQ2KokimqYGlfTxLKei60ZUG_ipq-VZ5_D2rGZAjxmOVEIVSJaezvrwZe2IywOyEQ=s2500","featuredImg":"","featuredImage":"","images":[],"balanceDisplayMode":"default","stats":[],"info":[]}}]}],"displayProps":{"appName":"Sudoswap","images":["https://storage.googleapis.com/zapper-fi-assets/apps/sudoswap.png"]},"meta":{"total":7256.5594200000005}}}

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

## `v2/apps/{appId}/balances`

The `v2/apps/{appId}/balances` endpoint is similar to the `v2/balances` query, but returns data only for a specific app, instead of ALL apps, tokens and NFTsin a wallet . You input wallet addresses and get all the following:
<ul>
<li>Detailed breakdown of all app investment positions represented as app tokens owned by the wallet, such as Aave lending positions or Uniswap pools, valued in USD</li>
<li>Detailed breakdown of all app investment positions represented as contract positions that are not held on the wallet, such ve-locked or farming positions, valued in USD</li>
</ul>

If you query for `appId` = `tokens`, you will get all tokens held in the wallet that are not associated with an App.

Notes on use of the API and limits
<ul>
<li>Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance</li>
<li>Any balance less than $0.01 USD value is not included in the output</li>
</ul>

### Path
`v2/apps/{appId}/balances`


### Format
JSON response

### Parameters
<ul>
<li><code>appId</code>: appId of the desired app</li>
<li><code>addresses[]</code>: *(required)* Addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses</li>
<li><code>networks[]</code>: Networks for which to retrieve balances, inputted an array</li>
</ul>

### Returns
<ul>
<li><code>appId</code>: ID of the app</li>
<li><code>network</code>: network the app is on</li>
<li><code>groupId</code>: group this particular investment belongs to within in the app, such as <code>pool</code> or <code>farms</code></li>
<li><code>balance</code>: details on the balance structure, and what kind of balance it is</li>
<li><code>type</code>: type of position the investment is. <code>contract-position</code> is if the investment is held on a 3rd party contract. <code>app-token</code> is if the wallet holds tokens in the wallet representing the investment</li>
<li><code>address</code>: address of token</li>
<li><code>symbol</code>: symbol of token</li>
<li><code>decimals</code>: decimals of token</li>
<li><code>supply</code>: supply of token</li>
<li><code>pricePerShare</code>: ratio of price to supply of assets</li>
<li><code>tokens</code>: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc</li>
<li><code>displayProps</code>: details on how to display the asset on Zapper's frontend</li>
<li><code>statsItems</code>: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc</li>
<li><code>meta</code>: total value of all positions in the app (example below has 3 different uniswap v2 positions)</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps/uniswap-v2/balances?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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
              "appId": "uniswap-v2",
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
              "appId": "uniswap-v2",
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

## `v2/apps/balances/supported`
Endpoint provides insight into what apps the wallet has investments in, and metadata about those apps

Notes on use of the API and limits
<ul>
<li>Maximum of 15 wallets can be passed into 1 call, though it's recommended you query wallets one at a time for best performance</li>
<li>Any balance less than $0.01 USD value is not included in the output</li>
</ul>

### Path
`v2/apps/{appId}/balances`

### Format
JSON response

### Parameters
<ul>
<li><code>addresses[]</code>: *(required)* Addresses for which to retrieve balances, inputted as an array. Can handle up to 15 addresses</li>
</ul>

### Returns
<ul>
<li><code>appId</code>: ID of the app</li>
<li><code>label</code>: App display name</li>
<li><code>img</code>: image used for the app's icon</li>
<li><code>tags</code>: tags associated with this app</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps/balances/supported?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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

# Apps queries

## `v2/apps/{appId}`
Provides metadata about a particular app, such as the networks it is available on and what investment groupings (`groupIds`) are included within it

### Path
`v2/apps/{appId}`

### Format
JSON output

### Parameters
<ul>
<li><code>appId</code>: *(required)* AppId to get data for</li>
</ul>

### Returns
<ul>
<li><code>Id</code>: ID of the app</li>
<li><code>name</code>: display name for app</li>
<li><code>description</code>: description of the app</li>
<li><code>groups</code>: groupings of different asset types, represented by groupIds, within the app</li>
<li><code>presentationConfig</code>: details on how to display the app's assets on the App's details page for Zapper's frontend</li>
<li><code>supportedNetworks</code>: Networks the app is available on</li>
<li><code>token</code>: Token associated with the app, if any</li>
<li><code>tags</code>: tags associated with this app</li>
<li><code>links</code>: relevant social links for the app and website</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps/aave-v3' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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

## `v2/apps`
Provides details on ALL apps listed on Zapper, including metadata. This will return 100s of apps

### Path
`v2/apps`

### Format
JSON response

### Parameters
None

### Returns
<ul>
<li><code>Id</code>: ID of the app</li>
<li><code>name</code>: display name for app</li>
<li><code>description</code>: description of the app</li>
<li><code>groups</code>: groupings of different asset types, represented by groupIds, within the app</li>
<li><code>presentationConfig</code>: details on how to display the app's assets on the App's details page for Zapper's frontend</li>
<li><code>supportedNetworks</code>: Networks the app is available on</li>
<li><code>token</code>: Token associated with the app, if any</li>
<li><code>tags</code>: tags associated with this app</li>
<li><code>links</code>: relevant social links for the app and website</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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
  .... you get the idea
```

## `v2/apps/{appId}/tokens`
Provides details on *app tokens* held within a given app for a given `groupId`, and the relevant data on them, such as supply, underlying tokens, APYs. This is more detailed than the breakdown provided in `v2/apps` and `v2/apps/{appId}`, as it includes data about the investments held within the app

> Note that this query will only return data if the `groupId` is represented by app tokens. If you are not getting results, try the following query on `v2/apps/{appId}/positions`

### Path
`v2/apps/{appId}/tokens`

### Format
JSON response
> Note: the shape of this response is a little different from `v2/apps/{appId}/positions`

### Parameters
<ul>
<li><code>appId</code>: *(required)* id of the app</li>
<li><code>network</code>: *(required)* network to query the app on</li>
<li><code>groupId</code>: *(required)* investment within the app data that is desired for</li>
</ul>

### Returns
<ul>
<li><code>appId</code>: ID of the app</li>
<li><code>network</code>: network the app is on</li>
<li><code>groupId</code>: group this particular investment belongs to within in the app, such as `pool` or `farms`</li>
<li><code>balance</code>: details on the balance structure, and what kind of balance it is</li>
<li><code>type</code>: type of position the investment is. <code>contract-position</code> is if the investment is held on a 3rd party contract. <code>app-token</code> is if the wallet holds tokens in the wallet representing the investment</li>
<li><code>address</code>: address of token</li>
<li><code>symbol</code>: symbol of token</li>
<li><code>decimals</code>: decimals of token</li>
<li><code>supply</code>: supply of token</li>
<li><code>price</code>: price of token</li>
<li><code>pricePerShare</code>: ratio of price to supply of assets</li>
<li><code>tokens</code>: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc</li>
<li><code>displayProps</code>: details on how to display the asset on Zapper's frontend</li>
<li><code>statsItems</code>: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps/aave-v3/tokens?network=avalanche&groupId=variable-debt' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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
...continued
```

## `v2/apps/{appId}/positions`
Provides details on *contract positions* held within a given app for a given `groupId`, and the relevant data on them, such as supply, underlying tokens, APYs. This is more detailed than the breakdown provided in `v2/apps` and `v2/apps/{appId}`, as it includes data about the investments held within the app in a given `groupId`

> Note that this query will only return data if the `groupId` is represented by contract positions. If you are not getting results, try the following query on `v2/apps/{appId}/tokens`

### Path
`v2/apps/{appId}/positions`

### Format
JSON response
> Note: the shape of this response is a little different from `v2/apps/{appId}/tokens`

### Parameters
<ul>
<li><code>appId</code>: *(required)* id of the app</li>
<li><code>network</code>: *(required)* network to query the app on</li>
<li><code>groupId</code>: *(required)* investment within the app data that is desired for</li>
</ul>

### Returns
<ul>
<li><code>appId</code>: ID of the app</li>
<li><code>network</code>: network the app is on</li>
<li><code>groupId</code>: group this particular investment belongs to within in the app, such as `pool` or `farms`</li>
<li><code>balance</code>: details on the balance structure, and what kind of balance it is</li>
<li><code>type</code>: type of position the investment is. <code>contract-position</code> is if the investment is held on a 3rd party contract. <code>app-token</code> is if the wallet holds tokens in the wallet representing the investment</li>
<li><code>address</code>: address of token</li>
<li><code>symbol</code>: symbol of token</li>
<li><code>decimals</code>: decimals of token</li>
<li><code>supply</code>: supply of token</li>
<li><code>price</code>: price of token</li>
<li><code>pricePerShare</code>: ratio of price to supply of assets</li>
<li><code>tokens</code>: details on underlying tokens in the investment, such as their address, price, symbol, daily volume, balance, etc</li>
<li><code>displayProps</code>: details on how to display the asset on Zapper's frontend</li>
<li><code>statsItems</code>: ancillary stats associated with the investment, such as APY, APR, liquidity, volume, fee, ratio of underlying assets, etc</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/apps/gmx/positions?network=arbitrum&groupId=farm' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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
... continued
```

# NFT queries

## `/v2/nft/balances/net-worth`
Provides the value of a wallet, or set of wallets, NFT portfolio, according to Zapper's price estimation.

### Path
`/v2/nft/balances/net-worth`

### Format
JSON response

### Parameters
<ul>
<li><code>addresses</code>: *(required)* Input addresses to get net worth for (maximum of 15)</li>
</ul>

### Returns
Net Worth in USD of the wallets NFTs

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/nft/balances/net-worth?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
{
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "65415.9656178"
}
```

## `/v2/nft/balances/collections`
Provides detailed breakdown of all collections owned in a given wallet, including collection metadata, estimated price for all NFTs owned in that collection, and trading volume for that collection in a given time period

### Path
`/v2/nft/balances/collections`

### Format
JSON response
> NOTE: the response is paginated, with a maximum number of 25 per response. You will need to parse through different pages, using `cursor` to get values beyond the initial 25

### Parameters
<ul>
<li><code>addresses</code>: *(required)* Input addresses to get net worth for (maximum of 15)</li>
<li><code>minCollectionValueUsd</code>: Returns only collections with an estimated value above the amount inputted</li>
<li><code>search</code>: Returns only collections with name starting with inputted string</li>
<li><code>collectionAddresses[]</code>: Returns only collections provided</li>
<li><code>network</code>: Returns only NFTs from network provided</li>
<li><code>limit</code>: Maximum items to return. Limited to 25 maximum</li>
<li><code>cursor</code>: Cursor used to paginate the results</li>
</ul>

### Returns
<ul>
<li><code>balance</code>: number of NFTs owned in the collection</li>
<li><code>balanceUSD</code>: estimated value of all the NFTs owned in the collection</li>
<li><code>name</code>: name of collection</li>
<li><code>network</code>: network of the collection</li>
<li><code>description</code>: description of the collection </li>
<li><code>logoImageUrl</code>: URL for logo image</li>
<li><code>cardImageUrl</code>: URL for card image</li>
<li><code>bannerImageUrl</code>: URL for banner image</li>
<li><code>nftStandard</code>: standard of the NFT (1155 or 721)</li>
<li><code>floorPriceEth</code>: floor price of collection in eth</li>
<li><code>marketCap</code>: market cap of the collection in eth</li>
<li><code>openseaId</code>: ID of collection on OpenSea</li>
<li><code>socialLinks</code>: links to various socials</li>
<li><code>stats</code>: stats on hourly/daily/weekly/total volume in eth for the collection</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/nft/balances/collections?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&limit=25' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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

## `/v2/nft/balances/collections-totals`
Provides a simple value returned for the total count of collections in the wallet, the estimated value of them.

Differs from `v2/nft/balances/net-worth` as you can scope down the NFTs you want the value for in the wallet

### Path
`/v2/nft/balances/collections-totals`

### Format
JSON response

### Parameters
<ul>
<li><code>addresses</code>: *(required)* Input addresses to get net worth for (maximum of 15)</li>
<li><code>minCollectionValueUsd</code>: Returns only collections with an estimated value above the amount inputted</li>
<li><code>search</code>: Returns only collections with name starting with inputted string</li>
<li><code>collectionAddresses[]</code>: Returns only collections provided</li>
<li><code>network</code>: Returns only NFTs from network provided</li>
</ul>

### Returns
<ul>
<li><code>count</code>: number of collections owned by the wallet</li>
<li><code>balanceUSD</code>: estimated value of all the NFTs owned in the wallet</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/nft/balances/collections-totals?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
{
  "count": "153",
  "balanceUSD": "65360.3215647"
}
```

## `/v2/nft/balances/tokens`
Provides detailed breakdown of all *individual NFTs* owned in a given wallet, including NFT metadata, collection metadata, estimated value for the NFT, last sale price, rarity, etc.

### Path
`/v2/nft/balances/tokens`

### Format
JSON response

### Parameters
<ul>
<li><code>addresses</code>: *(required)* Input addresses to get net worth for (maximum of 15)</li>
<li><code>minCollectionValueUsd</code>: Returns only collections with an estimated value above the amount inputted</li>
<li><code>search</code>: Returns only collections with name starting with inputted string</li>
<li><code>collectionAddresses[]</code>: Returns only collections provided</li>
<li><code>network</code>: Returns only NFTs from network provided</li>
<li><code>limit</code>: Maximum items to return. Limited to 25 maximum</li>
<li><code>cursor</code>: Cursor used to paginate the results</li>
</ul>

### Returns
<ul>
<li><code>token</code>
    <ul>
    <li><code>balance</code>: number of NFTs owned of a given type. If it's ERC_721, it will always be 1. If NFT is is ERC_1155, will be a count of how many NFTs are owned by this wallet</li>
    <li><code>name</code>: name of NFT</li>
    <li><code>tokenId</code>: ID of token within collection</li>
    <li><code>lastSaleEth</code>: price of last sale of this NFT</li>
    <li><code>rarityRank</code>: rank of this NFTs rarity, based on traits, within its collection</li>
    <li><code>estimatedValueEth</code>: estimated value of this NFT, based on various signals using Zapper's internal model</li>
    <li><code>medias</code>: link to image for NFT</li>
    </ul>
    </li>
<li><code>collection</code>
    <ul>
    <li><code>address</code>: collection address</li>
    <li><code>network</code>: network collection is on</li>
    <li><code>name</code>: name of collection</li>
    <li><code>nftStandard</code>: standard of the NFT (1155 or 721)</li>
    <li><code>floorPriceEth</code>: floor price of collection in eth</li>
    <li><code>logoImageURL</code>: URL for logo of collection</li>
    <li><code>openseaId</code>: ID of collection on OpenSea</li>
    </ul>
    </li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/nft/balances/tokens?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&collectionAddresses%5B%5D=0x47b648edd37aeae4f16d153451fd1784c1dd19a5&limit=25' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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

## `/v2/nft/balances/tokens-totals`
Provides a simple value returned for the total count of NFTs in the wallet, the estimated value of them.

Differs from `v2/nft/balances/collections-total` as it is at the NFT level for the counts.

### Path
`/v2/nft/balances/tokens-totals`

### Format
JSON response

### Parameters
<ul>
<li><code>addresses</code>: *(required)* Input addresses to get net worth for (maximum of 15)</li>
<li><code>minCollectionValueUsd</code>: Returns only collections with an estimated value above the amount inputted</li>
<li><code>search</code>: Returns only collections with name starting with inputted string</li>
<li><code>collectionAddresses[]</code>: Returns only collections provided</li>
<li><code>network</code>: Returns only NFTs from network provided</li>
</ul>

### Returns
<ul>
<li><code>count</code>: number of NFTs owned, where ERC_1155 NFTs count as 1 per collection</li>
<li><code>totalCount</code>: number of NFTs owned, where ERC_1155 NFTs count as 1 per NFT held</li>
<li><code>balanceUSD</code>: estimated value of all the NFTs owned in the wallet</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/nft/balances/tokens-totals?addresses%5B%5D=0xd8da6bf26964af9d7eed9e03e53415d37aa96045' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
{
  "count": "917",
  "totalCount": "1956",
  "balanceUSD": "65368.999995"
}
```

# Exchange queries

## `/v2/exchange/price`
Returns data about the amount received if a trade would be made. Should be called whenever a price needs to be calculated.

### Path
`/v2/exchange/price`

### Format
JSON response

### Parameters
<ul>
<li><code>gasPrice</code>: Gas price (wei)</li>
<li><code>maxFeePerGas</code>: Max gas fee (wei)</li>
<li><code>maxPriorityFeePerGas</code>: Max priority gas fee (wei)</li>
<li><code>sellTokenAddress</code>: Address of the token that is being sold</li>
<li><code>buyTokenAddress</code>: Address of the token that is being bought</li>
<li><code>sellAmount</code>: Amount to sell</li>
<li><code>buyAmount</code>: Amount to buy</li>
<li><code>ownerAddress</code>: Address of the owner</li>
<li><code>slippagePercentage</code>: Slippage percentage as a decimal value</li>
<li><code>network</code>: Network where the swap would be made</li>
</ul>

### Returns
<ul>
<li><code>price</code>: price of the sell token</li>
<li><code>value</code>: token value assouciated with price</li>
<li><code>gas</code>: gas limit of the transaction</li>
<li><code>estimatedGas</code>: gas required for the transaction</li>
<li><code>gasPrice</code>: gas price at the time of transaction</li>
<li><code>maxPriorityFeePerGas</code>: maximum priority fee for gas in this speed tier</li>
<li><code>maxFeePerGas</code>: max fee for gas in this gas speed tier</li>
<li><code>buyTokenAddress</code>: token address for the token wanting to buy</li>
<li><code>sellTokenAddress</code>: token address for the token wanting to sell</li>
<li><code>buyAmount</code>: total quantity of buy token</li>
<li><code>sellAmount</code>: total quantity of sell token</li>
<li><code>allowanceTarget</code>: token address of token that is approved to sell</li>
<li><code>source</code>q
  </ul>
  <li><code>name</code>: source of swap route</li>
  <li><code>proportion</code>: proportion of tokens swapped by this source</li>
  <li><code>displayName</code>: display name of source</li>
  <li><code>symbol</code>: symbol of source</li>
  <li><code>hops</code>: number of hops needed for swap</li>
  </ul>
  </li>
<li><code>zapperFee</code>: percentage of fees from swap</li>
</ul>
</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/exchange/price?sellTokenAddress=0x0000000000000000000000000000000000000000&buyTokenAddress=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&sellAmount=1000000000000000000&ownerAddress=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&slippagePercentage=0.03&network=ethereum' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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

## `/v2/exchange/quote`
Returns both the relative price for a trade as well as the call data used to submit a transaction for a trade. Should only be called when a trade is ready to be submitted.

### Path
`/v2/exchange/quote`

### Format
JSON response

### Parameters
<ul>
<li><code>gasPrice</code>: Gas price (wei)</li>
<li><code>maxFeePerGas</code>: Max gas fee (wei)</li>
<li><code>maxPriorityFeePerGas</code>: Max priority gas fee (wei)</li>
<li><code>sellTokenAddress</code>: Address of the token that is being sold</li>
<li><code>buyTokenAddress</code>: Address of the token that is being bought</li>
<li><code>sellAmount</code>: Amount to sell</li>
<li><code>buyAmount</code>: Amount to buy</li>
<li><code>ownerAddress</code>: Address of the owner</li>
<li><code>slippagePercentage</code>: Slippage percentage as a decimal value</li>
<li><code>network</code>: Network where the swap would be made</li>
</ul>

### Returns
TODO

### Curl
```
TODO
```

### Response
```
TODO
```

## `/v2/exchange/supported`
Returns the exchanges supported by Zapper API.

### Path
`/v2/exchange/supported`

### Format
JSON response

### Parameters
None

### Returns
<ul>
<li><code>network</code>: network name available for swaps</li>
<li><code>label</code>: label of network</li>
<li><code>numTokens</code>: number of tokens available to be swapped on that network</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/exchange/supported' \
  -H 'accept: */*' \
  -H 'Authorization: Basic sadkfljsdafksal24uh2jk34=='
```

### Response
```
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
# Miscellaneous Data Endpoints

## `/v2/prices`
Retrieve supported tokens and their prices. Generally populated by data from CoinGecko

### Path
`/v2/prices`

### Format
JSON response

### Parameters
<ul>
<li><code>network</code>: retrieve tokens for this specified network</li>
</ul>

### Returns
<ul>
<li><code>id</code>: internal token id</li>
<li><code>networkId</code>: internal network id</li>
<li><code>address</code>: token's address</li>
<li><code>name</code>: label for token</li>
<li><code>symbol</code>: symbol for token</li>
<li><code>decimals</code>: decimals for token</li>
<li><code>coingeckoId</code>: coingecko API id for token</li>
<li><code>status</code>: internal designation if token has been initially reviewed when ingested</li>
<li><code>hide</code>: internal designation if token is approved for displaying</li>
<li><code>canExchange</code>: flag if this token is exchangeable on Zapper's front end</li>
<li><code>verified</code>: if token is on a verified token list, and has a blue-checkmark on Zapper's frontend</li>
<li><code>updatedAt</code>: last date token was updated from CoinGecko</li>
<li><code>createdAt</code>: date token was first ingested</li>
<li><code>price</code>: current price of token in USD</li>
<li><code>dailyVolume</code>: trading volume of token from coingecko</li>
<li><code>totalSupply</code>: total supply of token available</li>
<li><code>networkEnumValue</code>: network token is on</li>
<li><code>type</code>: designation if the token is a base-token or app-token (meaning the token is associated with an app's investment)</li>
<li><code>network</code>: label of network token is on</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/prices?network=optimism' \
  -H 'accept: */*' \
  -H 'Authorization: Basic asdadsadada12341=='
```

### Response
```
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
...
]
```

## `/v2/gas-prices`
Retrieve supported tokens and their prices across many currencies

### Path
`/v2/gas-prices`

### Format
JSON response

### Parameters
<ul>
<li><code>network</code>: Retrieve gas prices for this network</li>
<li><code>eip1559</code>: *(required)* boolean flag for Retrieve post London gas price details</li>
</ul>

### Returns
<ul>
<li><code>eip1559</code>: coingecko API id for token</li>
<li><code>baseFeePerGas</code>: base fee for gas in this gas speed tier</li>
<li><code>maxPriorityFeePerGas</code>: maximum priority fee for gas in this speed tier</li>
<li><code>maxFeePerGas</code>: max fee for gas in this gas speed tier</li>
</ul>

### Curl
```
curl -X 'GET' \
  'https://api.zapper.fi/v2/gas-prices?network=ethereum&eip1559=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic asdadsadada12341=='
```

### Response
```
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



