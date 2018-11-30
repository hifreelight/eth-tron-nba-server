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



2018-11-13T10:28:45.495Z rand:boot:betTownFomo fomo getGame data is Result { '0': '', '1': '0', '2': '0', '3': false, '4': false, '5': false, '6': '0', '7': '0', '8': '', '9': '0', name: '', numberOfTeams: '0', gameStartTime: '0', paused: false, ended: false, canceled: false, winnerTeam: '0', withdrawDeadline: '0', gameEndComment: '', closeTime: '0' }
2018-11-13T10:28:45.496Z rand:boot:betTownFomo gameId : 16 not in db
2018-11-14T01:53:00.090Z rand:schedule call contract closeGame
2018-11-14T01:53:01.670Z rand:lib:betTownFomo fun: setCloseTime, args: 3 1542160381
2018-11-14T01:53:02.948Z rand:lib:betTownFomo pubWeb3Provider WS closed
2018-11-14T01:53:02.948Z rand:lib:betTownFomo Attempting to reconnect...
2018-11-14T01:53:04.082Z rand:lib:betTownFomo WS connected.
2018-11-14T01:53:10.106Z rand:schedule call contract closeGame
2018-11-14T01:53:10.221Z rand:schedule closeGame err is eventId : 130878 has close
2018-11-14T01:53:20.095Z rand:schedule call contract closeGame
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

sport: https://ropsten.etherscan.io/address/0xB36281e10a881E9F166CF3Ca625F38d724fCc080#code

## tron

var GameAddr = 'TDdLb1xp4E2zLEtKmKg5z1Ycm1uCqpezZf';
var BookAddr = 'TQP9RSKu218R6UocK4txTP5Di9wzTeRazq';

https://api.shasta.trongrid.io/wallet/getcontract?value=41281E84151FB705332E682B562CC41662CA91C8FF

https://explorer.shasta.trongrid.io/address/TNqLSgPhUMNJKATaoE8mTAZUkPNdY9WtVg

bank: https://api.shasta.trongrid.io/wallet/getcontract?value=4123a3f8092ca7407be91bb09a56e3d952948e4a82

[资源冻结抵押转换](https://tronstation.io/energycalc)
[编码转换工具](https://tronscan.org/#/tools/tron-convert-tool)

智能合约的创建和运行需要消耗CPU资源，用于确定智能合约在虚拟机执行过程中消耗的系统时间，单位为微秒。CPU资源以Energy为单位消耗，也就是说1Energy == 1 微秒。 如一条合约在虚拟机中执行花费100微秒，即需要消耗100Energy。 24小时内，TRON网络提供的总CPU资源为50_000_000_000Energy。

带宽
普通的转账是不收手续费的，但是会消耗bd ，如果bd 不足的情况下会消耗trx
bd是跟字节有关，一般一笔交易是200字节左右
每天会有5000免费带宽
1bd= 10Sun
https://developers.tron.network/docs/bandwith
每笔交易消耗的trx根据交易大小计算而来，10sun/byte
一般一笔交易是200字节左右，即一笔交易0.002TRX
如果是激活新的账户的话，也是需要0.1trx的，所以如果你是向一个新的账户转账，也是需要消耗0.1trx 的手续费的
能量
1energy = 20sun
1trx 也就是 50000energy
