'use strict';

const Web3Util = require('./lib/web3-util');
let weiToFluRate = parseInt(process.env.WEI_TO_FLU_RATE || 1000000000000000000);

module.exports = async function(app) {
  app.web3 = new Web3Util(app);
  let err;

  await app.web3.isListening()
    .catch(e => {
      console.log('web3 private service cannot be connected.');
      err = e;
    });
  await app.web3.isListening(true)
    .catch(e => {
      console.log('web3 public service cannot be connected.');
      err = e;
    });

  if (err) {
    console.error(err);
    // WORKAROUND: process will hang
    process.exit(-1);
  }

  await app.web3.setScanBlockNumber();

  let publicMainAddress = process.env.PUB_MAIN_ADDRESS || '0X15cbc969013b8a7ab9d6111cbfde9d81c7aea05b';
  console.log('public receiving address is:', publicMainAddress);

  app.web3.on('receive eth', async (transaction, web3) =>  {
    console.log('receive eth', transaction);
    try {
      let w = await app.models.Wallet.findOne({ where: { pubilcAddress: transaction.to.toLowerCase() } });
      if (w) {
        await app.web3.sendToken('ETH', publicMainAddress, transaction.value, w.pubilcAddress, w.pubilcSecret.substring(2));
        await app.web3.sendToken('FlashU', w.address, transaction.value / weiToFluRate);
      } else {
        console.error('cannot find wallet', transaction.to);
      }
    } catch (e) {
      console.error('receive eth error:', e);
    }
  });

  // FIXME: paging
  let wallets = await app.models.Wallet.find({ fields: { pubilcAddress: true } });
  let addresses = wallets.map(w => w.pubilcAddress.toLowerCase());
  await app.web3.addWatchAddress(addresses);

  await onTime(app.web3);

  console.log('all web3 services are connected.');
};

async function onTime(web3) {
  console.log('scaning begins');
  await web3.scanTransaction();
  console.log('scaning done');
  setTimeout(onTime, 10000, web3);
}
