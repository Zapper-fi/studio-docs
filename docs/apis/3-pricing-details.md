---
sidebar_position: 3
---

# API Usage: API Points, Free Monthly Quota and Purchasing More Points

Zapper API uses a points system to manage how many queries an API key can perform. Each query made costs a certain amount of points, and these points are deducted from your points balance.

## Free monthly quota of points

To support hobbyist developers and personal projects, all API clients receive **10,000 free API points** at the start of each month.  The 10,000 points granted each month is the equivalent of 10,000 free queries per month on non-`v2/balance` endpoints.

The free points expire at the end of the month, so it's a "use-it-or-lose-it" situation within the month. Note that these points are granted to each API client, and not on an API-key basis. If you have multiple API keys associated with your account, all your keys will share the same pool of points.

:::caution
It is also against [Zapper's API terms of use](https://zapper.xyz/docs/api-terms-of-use.pdf) to register multiple API clients for the same  entity with the goal of accumulating large amounts of free point distributions, and you will be banned. Please do not abuse our APIs in this way.
:::

## Cost of Queries

The points breakdown is as follows:
| Endpoint                     	| Points cost for query 	|
|------------------------------	|-----------------------	|
| GET v2/balances (deprecated) 	| 7 points              	|
| POST v2/balances/apps        	| 4 points              	|
| POST v2/balances/tokens      	| 1 point               	|
| GET v2/balances/apps         	| 0.25 points           	|
| GET v2/balances/tokens       	| 0.25 points           	|
| GET v2/balances/job-status   	| 0 points              	|
| All other endpoints          	| 1 point               	|

:::note
When querying, each wallet counts as 1 query, even if multiple addresses are bundled into 1 call. By way of example only, if you pass 10 Wallets into 1 API call of v2/balances endpoint, that will count as 10 queries of that endpoint, for a total of 70 points.
:::

## Paid API plans for larger API users

There are many API users who's query volume needs exceed the 10,000 points quota in a given month. For these users, there is the option to purchase additional points.

Points that are purchased expire after 12 months, allowing developers to consume them over time, across many months. This is helpful, as Zapper offers discounts on larger point purchases.

![Breakdown of amount of points received per USD](../../static/img/assets/points_purchase_table.png)

### Illustrative examples of how purchasing points work with discounts

If you purchase $10,000 USD worth of Points, then you would receive $10,000 x 1,333 Points = 13,330,000 Points, because a $10,000 purchase is in the Base tier for pricing. Your purchased Points would pay for either 1,904,285 queries of the v2/balances endpoint (as each of v2/balances query costs 7 Points), or 13,330,000 queries of all other endpoints (as those are 1 point each).

As another example, if you purchased $300,000 USD worth of Points, you would receive 666,600,000 Points, as $1 USD gets you 2,222 Points in the Top tier (for pre-purchases greater than $250,000).

However, sequential, lower value pre-purchases do not sum to increase the pricing tier. By way of example only, one $10,000 USD purchase cannot be combined with a $15,000 USD purchase a week later to claim Middle tier pricing. Both purchases generate 1,333 Points per USD.

## Other benefits of being on a paid plan

**Higher RPMs**: We will use our best effort to accommodate higher RPM rates if your business needs it and you have purchased points. Please reach out to us to discuss at [partnerships@zapper.xyz](mailto:partnerships@zapper.xyz).

**Direct line of communication with dev team**: If you purchase more than $25,000 USD in points, we will establish a private telegram/discord chat with Zapper product and engineering team; This will offer you a line of communication to Zapper’s product team for you to provide Feedback, ask technical questions about our APIs, highlight issues you're running into while building and to offer you an early heads-up on API changes.

## How to purchase API points

You can pay either on-chain, using USDC, or off-chain, using credit cards, debit cards, bank account details, etc.

### Paying off-chain (with credit card)

To pay using a credit card, debit card or bank account, simply **[follow this link to our Stripe checkout flow.](https://buy.stripe.com/8wMcPb8fC2jl1wI8wz)**

Once the purchase is completed, we will credit your API key with the corresponding amount of API points purchased. Note that today, we manually process adding the API points upon receiving your payment, so there may be some delay from when you purchase to when you get your points. Feel free to reach out to [partnerships@zapper.xyz](mailto:partnerships@zapper.xyz) if you have any issues.

Note that if you require an invoice to be sent to you that shows our business address and your business's details, [please fill out this form](https://zapperfi.zendesk.com/hc/en-us/requests/new?ticket_form_id=10132222946321), and we will issue you an invoice shortly, through which you can pay.

### Paying on-chain (Ethereum)

All payments will be made in USDC on the **Ethereum network**, paid to the address `0x7EA6CfC929f2425720c5964494B96661576f9cFa`. This address is a multi-sig on Ethereum; please be sure to not send any funds to this address on any other network than Ethereum, or else the funds will be lost.

Once you have completed the transaction, [please fill out this form](https://zapperfi.zendesk.com/hc/en-us/requests/new?ticket_form_id=10132222946321) and include a link to the transaction, so we can connect the transaction with your API account. We will then credit your account with the API credits. Note that there will be a small delay between your payment and getting the points attributed to you, as we are manually adding the points.

## Monitoring API use and API point purchases

We recognize not everyone is able to build monitoring for their API usage, so we have built a dashboard for API users to understand their query volume, points usage, and see their points purchase history.

**You can find the [dashboard at this link](https://datastudio.google.com/reporting/88563472-154b-44d2-aba4-339e9f4ba674).**

The first time you access the dashboard, you will need to request access, and access requires a Google-managed email address to be granted. We plan to launch an updated API partner portal in the coming months that will not have this Google dependency.

The dashboard operates using the first 8 characters of your API key, which you input into the green box in the top right of the dashboard when accessed. So, if your API key `12345678-abced-abc123123`, you would input `12345678` into that box.

If you do not have a Google-managed email, or do not want to sign-up with that email, you can instead reach out to us at [partnerships@zapper.xyz](mailto:partnerships@zapper.xyz) and we can send you your API usage details directly.

:::info
For any API related inquiries, please reach out in the
[#api-buildooorrs channel](https://discord.com/channels/647279669388771329/650654989202489354)
in the [Zapper Discord](https://zapper.xyz/discord).
:::
