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

## Q&A

q:
connection not open on send()
Error: connection not open
    at WebsocketProvider.send (E:\blockchain\svc-rand\node_modules\_web3-providers-ws@1.0.0-beta.36@web3-providers-ws\src\index.js:276:18)
    at RequestManager.send (E:\blockchain\svc-rand\node_modules\_web3-core-requestmanager@1.0.0-beta.36@web3-core-requestmanager\src\index.js:132:66)
    at sendRequest (E:\blockchain\svc-rand\node_modules\_web3-core-method@1.0.0-beta.36@web3-core-method\src\index.js:560:42)
    at Eth.send [as getTransactionCount] (E:\blockchain\svc-rand\node_modules\_web3-core-method@1.0.0-beta.36@web3-core-method\src\index.js:581:13)
    at BetTownFomo.send (e:\blockchain\svc-rand\server\lib\betTownFomo.js:43:32)
    at BetTownFomo.settleGame (e:\blockchain\svc-rand\server\lib\betTownFomo.js:107:17)
    at settleGameCache.then.then.then.teams (e:\blockchain\svc-rand\server\boot\schedule.js:88:14)
    at <anonymous>
a:...

q:
Error: Returned error: replacement transaction underpriced
a:...

q:
Error: CONNECTION ERROR: Couldn't connect to node on WS.

## contract
0x21f8aaf0e90f8a675dd512D83A0C926658e8E77e  
Bank

0xe490226Adfb0AfFE5c7634449B3A5517c6Bee9cF
Book

0xC5Ec9DccEC8b8E3156F3177276f79ebf208Ca3c5
Sport

[return function value instead of transaction receipt with web3](https://ethereum.stackexchange.com/questions/58228/return-function-value-instead-of-transaction-receipt-with-web3)

https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=true

https://ropsten.etherscan.io/address/0xccddbf11a195576dec97c5a11a2718e91fc648e2

https://fomosports.me/nba-18-19
