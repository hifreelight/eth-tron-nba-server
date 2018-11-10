# 随机数


## 流程
a weely ->db -> contract send createGame

contract listening -> gameId-> contract call game_ -> db(update gameId,isCreated) -> setTimeout contract send active

setTimeout api score -> db save -> get game status -> contract closeGame and settleGame (once)

## 直播数据

get: http://localhost:2005/api/v1/service/matches

{"where":{"category":"yingchao"},"order":"time asc"}

{"where":{"category":"nba"},"order":"time asc"}

## 列表

get: /api/v1/service/matches/basketball

```js
{
  status: 'open' // opening coming over
}
```

## 测试

mocha -f 'test RollDice' test/web3.js

mocha -f 'test events LogResult' test/web3.js

dice合约地址 https://ropsten.etherscan.io/address/0xBDd3Ee8afa7b41F1BDfe02200bFA171535caFc27

mocha -f 'test createGame' test/fomoTest.js


## TODO

1. 签名 √
2. 监听交易 √
3. 生成随机数
4. 合约保存数据 √
5. 部署 rand.bet.town api.bet.town
ip限制 √
详情 √
是否激活、是否关闭、是否结算

[return function value instead of transaction receipt with web3](https://ethereum.stackexchange.com/questions/58228/return-function-value-instead-of-transaction-receipt-with-web3)

https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=true

https://ropsten.etherscan.io/address/0xccddbf11a195576dec97c5a11a2718e91fc648e2

https://fomosports.me/nba-18-19
