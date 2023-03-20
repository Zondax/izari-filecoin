/**
 * System singleton actor ids
 * For more information about system actors, please refer to this {@link https://spec.filecoin.io/systems/filecoin_vm/sysactors/#section-systems.filecoin_vm.sysactors.initactor|link}
 */
export enum SystemActorIDs {
  System = 0,
  Init = 1,
  Reward = 2,
  Cron = 3,
  StoragePower = 4,
  StorageMarket = 5,
  VerifiedRegistry = 6,
  DataCap = 7,
  EAM = 10,
}

export enum InitActorMethods {
  Exec = 2,

  Exec4 = 3,
}

/**
 Actor content IDs version 13 for hyperspace network
 * For more information about the actors cid v10, please refer to this {@link https://github.com/filecoin-project/lotus/releases/tag/v1.20.0|link}
 */
export enum ActorsHyperspaceV13 {
  Account = 'bafk2bzaceampw4romta75hyz5p4cqriypmpbgnkxncgxgqn6zptv5lsp2w2bo',
  Cron = 'bafk2bzacedcbtsifegiu432m5tysjzkxkmoczxscb6hqpmrr6img7xzdbbs2g',
  DataCap = 'bafk2bzacealj5uk7wixhvk7l5tnredtelralwnceafqq34nb2lbylhtuyo64u',
  EAM = 'bafk2bzacedrpm5gbleh4xkyo2jvs7p5g6f34soa6dpv7ashcdgy676snsum6g',
  EthAccount = 'bafk2bzaceaqoc5zakbhjxn3jljc4lxnthllzunhdor7sxhwgmskvc6drqc3fa',
  EVM = 'bafk2bzaceahmzdxhqsm7cu2mexusjp6frm7r4kdesvti3etv5evfqboos2j4g',
  Init = 'bafk2bzaced2f5rhir3hbpqbz5ght7ohv2kgj42g5ykxrypuo2opxsup3ykwl6',
  Multisig = 'bafk2bzaceduf3hayh63jnl4z2knxv7cnrdenoubni22fxersc4octlwpxpmy4',
  PaymentChannel = 'bafk2bzaceanhwrm5azy7c5pgpaarf4ih2cvdjy2gcz3xhz5hzix5dfrqysffu',
  Placeholder = 'bafk2bzacedfvut2myeleyq67fljcrw4kkmn5pb5dpyozovj7jpoez5irnc3ro',
  Reward = 'bafk2bzacebnhtaejfjtzymyfmbdrfmo7vgj3zsof6zlucbmkhrvcuotw5dxpq',
  StorageMarket = 'bafk2bzaceclejwjtpu2dhw3qbx6ow7b4pmhwa7ocrbbiqwp36sq5yeg6jz2bc',
  StorageMiner = 'bafk2bzaced4h7noksockro7glnssz2jnmo2rpzd7dvnmfs4p24zx3h6gtx47s',
  StoragePower = 'bafk2bzacec4ay4crzo73ypmh7o3fjendhbqrxake46bprabw67fvwjz5q6ixq',
  System = 'bafk2bzacedakk5nofebyup4m7nvx6djksfwhnxzrfuq4oyemhpl4lllaikr64',
  VerifiedRegistry = 'bafk2bzacedfel6edzqpe5oujno7fog4i526go4dtcs6vwrdtbpy2xq6htvcg6',
}

/**
 * Actor content IDs version 10 for calibration network
 * For more information about the actors cid v10, please refer to this {@link https://github.com/filecoin-project/lotus/releases/tag/v1.20.0|link}
 */
export enum ActorsCalibrationV10 {
  Account = 'bafk2bzacebhfuz3sv7duvk653544xsxhdn4lsmy7ol7k6gdgancyctvmd7lnq',
  Cron = 'bafk2bzacecw2yjb6ysieffa7lk7xd32b3n4ssowvafolt7eq52lp6lk4lkhji',
  DataCap = 'bafk2bzaceaot6tv6p4cat3cg5fknq22htosw3p5rwyijmdsraatwqyc4qyero',
  EAM = 'bafk2bzacec5untyj6cefdsfm47wckozw6wt6svqqh5dzh63nu4f6dvf26fkco',
  EthAccount = 'bafk2bzacebiyrhz32xwxi6xql67aaq5nrzeelzas472kuwjqmdmgwotpkj35e',
  EVM = 'bafk2bzaceblpgzid4qjfavuiht6uwvq2lznshklk2qmf5akm3dzx2fczdqdxc',
  Init = 'bafk2bzacedhxbcglnonzruxf2jpczara73eh735wf2kznatx2u4gsuhgqwffq',
  Multisig = 'bafk2bzacebv5gdlte2pyovmz6s37me6x2rixaa6a33w6lgqdohmycl23snvwm',
  PaymentChannel = 'bafk2bzacea7ngq44gedftjlar3j3ql3dmd7e7xkkb6squgxinfncybfmppmlc',
  Placeholder = 'bafk2bzacedfvut2myeleyq67fljcrw4kkmn5pb5dpyozovj7jpoez5irnc3ro',
  Reward = 'bafk2bzacea3yo22x4dsh4axioshrdp42eoeugef3tqtmtwz5untyvth7uc73o',
  StorageMarket = 'bafk2bzacecclsfboql3iraf3e66pzuh3h7qp3vgmfurqz26qh5g5nrexjgknc',
  StorageMiner = 'bafk2bzacedu4chbl36rilas45py4vhqtuj6o7aa5stlvnwef3kshgwcsmha6y',
  StoragePower = 'bafk2bzacedu3c67spbf2dmwo77ymkjel6i2o5gpzyksgu2iuwu2xvcnxgfdjg',
  System = 'bafk2bzacea4mtukm5zazygkdbgdf26cpnwwif5n2no7s6tknpxlwy6fpq3mug',
  VerifiedRegistry = 'bafk2bzacec67wuchq64k7kgrujguukjvdlsl24pgighqdx5vgjhyk6bycrwnc',
}

/**
 * Actor content IDs version 10 for mainnet network
 * For more information about the actors cid v10, please refer to this {@link https://github.com/filecoin-project/lotus/releases/tag/v1.20.0|link}
 */
export enum ActorsMainnetV10 {
  Account = 'bafk2bzacebhfuz3sv7duvk653544xsxhdn4lsmy7ol7k6gdgancyctvmd7lnq',
  Cron = 'bafk2bzacecw2yjb6ysieffa7lk7xd32b3n4ssowvafolt7eq52lp6lk4lkhji',
  DataCap = 'bafk2bzaceaot6tv6p4cat3cg5fknq22htosw3p5rwyijmdsraatwqyc4qyero',
  EAM = 'bafk2bzacec5untyj6cefdsfm47wckozw6wt6svqqh5dzh63nu4f6dvf26fkco',
  EthAccount = 'bafk2bzacebiyrhz32xwxi6xql67aaq5nrzeelzas472kuwjqmdmgwotpkj35e',
  EVM = 'bafk2bzaceblpgzid4qjfavuiht6uwvq2lznshklk2qmf5akm3dzx2fczdqdxc',
  Init = 'bafk2bzacedhxbcglnonzruxf2jpczara73eh735wf2kznatx2u4gsuhgqwffq',
  Multisig = 'bafk2bzacebv5gdlte2pyovmz6s37me6x2rixaa6a33w6lgqdohmycl23snvwm',
  PaymentChannel = 'bafk2bzacea7ngq44gedftjlar3j3ql3dmd7e7xkkb6squgxinfncybfmppmlc',
  Placeholder = 'bafk2bzacedfvut2myeleyq67fljcrw4kkmn5pb5dpyozovj7jpoez5irnc3ro',
  Reward = 'bafk2bzacea3yo22x4dsh4axioshrdp42eoeugef3tqtmtwz5untyvth7uc73o',
  StorageMarket = 'bafk2bzacecclsfboql3iraf3e66pzuh3h7qp3vgmfurqz26qh5g5nrexjgknc',
  StorageMiner = 'bafk2bzacedu4chbl36rilas45py4vhqtuj6o7aa5stlvnwef3kshgwcsmha6y',
  StoragePower = 'bafk2bzacedu3c67spbf2dmwo77ymkjel6i2o5gpzyksgu2iuwu2xvcnxgfdjg',
  System = 'bafk2bzacea4mtukm5zazygkdbgdf26cpnwwif5n2no7s6tknpxlwy6fpq3mug',
  VerifiedRegistry = 'bafk2bzacec67wuchq64k7kgrujguukjvdlsl24pgighqdx5vgjhyk6bycrwnc',
}
