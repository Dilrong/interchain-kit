/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChainContext,
  ChainName,
  WalletManager,
  WalletStatus,
} from '@cosmos-kit/core';
import React from 'react';

import { walletContext } from './provider';
import { walletContextV2 } from './provider-v2';

export const useWallet = (): WalletManager => {
  const context = React.useContext(walletContext);

  if (!context || !context.walletManager) {
    throw new Error('You have forgot to use WalletProvider.');
  }

  return context.walletManager;
};

export const useChain = (chainName: ChainName): ChainContext => {
  const context = React.useContext(walletContextV2);

  if (!context) {
    throw new Error('You have forgot to use WalletProviderV2.');
  }

  const { walletManager } = context;
  const walletRepo = walletManager.getWalletRepo(chainName);
  walletRepo.isInUse = true;
  const {
    connect,
    disconnect,
    openView,
    closeView,
    current,
    chainRecord: { chain, assetList },
    getRpcEndpoint,
    getRestEndpoint,
    getStargateClient,
    getCosmWasmClient,
  } = walletRepo;

  const chainId = chain.chain_id;

  async function connectionAssert(
    func: (...params: any) => any,
    params?: any[]
  ) {
    if (!current) {
      throw new Error(`Wallet not connected yet.`);
    }

    return params ? await func(...params) : await func();
  }

  async function clientMethodAssert(
    func: (...params: any) => any,
    params: any[],
    name: string
  ) {
    if (!current) {
      throw new Error(`Wallet not connected yet.`);
    }

    if (!current?.client) {
      throw new Error(`Wallet Client not defined.`);
    }

    if (!func) {
      throw new Error(
        `Function ${name} not implemented by ${current?.walletInfo.prettyName} yet.`
      );
    }

    return await func(...params);
  }

  return {
    // walletRepo: walletRepo,
    // wallet: current,

    chain,
    assets: assetList,
    logoUrl: current?.chainLogoUrl,
    wallet: current?.walletInfo,
    address: current?.address,
    username: current?.username,
    message: current ? current.message : 'No wallet is connected currently.',
    status: current?.walletStatus || WalletStatus.Disconnected,

    openView,
    closeView,
    connect,
    disconnect,
    getRpcEndpoint,
    getRestEndpoint,
    getStargateClient,
    getCosmWasmClient,
    getSigningStargateClient: () =>
      connectionAssert(current?.getSigningStargateClient),
    getSigningCosmWasmClient: () =>
      connectionAssert(current?.getSigningCosmWasmClient),
    estimateFee: (...params: Parameters<ChainContext['estimateFee']>) =>
      connectionAssert(current?.estimateFee, params),
    sign: (...params: Parameters<ChainContext['sign']>) =>
      connectionAssert(current?.sign, params),
    broadcast: (...params: Parameters<ChainContext['broadcast']>) =>
      connectionAssert(current?.broadcast, params),
    signAndBroadcast: (
      ...params: Parameters<ChainContext['signAndBroadcast']>
    ) => connectionAssert(current?.signAndBroadcast, params),

    enable: (chainIds?: string | string[]) =>
      clientMethodAssert(
        current?.client?.enable,
        [chainIds || chainId],
        'enable'
      ),
    getOfflineSigner: async () =>
      clientMethodAssert(
        current?.client?.getOfflineSigner,
        [chainId],
        'getOfflineSigner'
      ),
    signAmino: (...params: Parameters<ChainContext['signAmino']>) =>
      clientMethodAssert(
        current?.client?.signAmino,
        [chainId, ...params],
        'signAmino'
      ),
    signDirect: (...params: Parameters<ChainContext['signDirect']>) =>
      clientMethodAssert(
        current?.client?.signDirect,
        [chainId, ...params],
        'signDirect'
      ),
    sendTx: (...params: Parameters<ChainContext['sendTx']>) =>
      clientMethodAssert(
        current?.client?.sendTx,
        [chainId, ...params],
        'sendTx'
      ),
  };
};
