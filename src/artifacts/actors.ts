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
 * Actor content IDs version 13
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
