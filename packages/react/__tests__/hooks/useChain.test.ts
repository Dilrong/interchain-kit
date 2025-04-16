/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useChain } from '../../src/hooks/useChain';
import { useWalletManager } from '../../src/hooks/useWalletManager';
import { useWalletModal } from '../../src/modal';
import { ChainNameNotExist, ChainNotExist, WalletState } from '@interchain-kit/core';
import { ChainWalletState, InterchainStore } from '../../src/store';
import { MockWallet } from '../helpers/mock-wallet';

jest.mock('../../src/hooks/useWalletManager');
jest.mock('../../src/modal');

describe('useChain', () => {
  const mockChain = { chainName: 'test-chain', chainType: 'cosmos' as const };
  const mockUseWalletManager = useWalletManager as jest.MockedFunction<typeof useWalletManager>;
  const mockUseWalletModal = useWalletModal as jest.MockedFunction<typeof useWalletModal>;

  const mockWallet = new MockWallet({ name: 'test-wallet', mode: 'extension', prettyName: 'Test Wallet' });

  const mockWalletManager: jest.Mocked<InterchainStore> = {
    chains: [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
    assetLists: [{ chainName: 'test-chain', assets: [] }],
    wallets: [mockWallet],
    currentWalletName: 'test-wallet',
    currentChainName: 'test-chain',
    chainWalletState: [],
    walletConnectQRCodeUri: '',
    signerOptions: {},
    signerOptionMap: {},
    endpointOptions: {},
    endpointOptionsMap: {},
    preferredSignTypeMap: {},
    init: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    addChains: jest.fn(),
    setCurrentChainName: jest.fn(),
    setCurrentWalletName: jest.fn(),
    getChainByName: jest.fn().mockReturnValue({ name: 'test-chain' }),
    getDraftChainWalletState: jest.fn(),
    updateChainWalletState: jest.fn(),
    getAssetListByName: jest.fn(),
    getPreferSignType: jest.fn(),
    getSignerOptions: jest.fn(),
    getOfflineSigner: jest.fn(),
    getWalletByName: jest.fn(),
    getChainWalletState: jest.fn(),
    getChainLogoUrl: jest.fn(),
    getSigningClient: jest.fn(),
    getRpcEndpoint: jest.fn(),
    getAccount: jest.fn(),
    getEnv: jest.fn(),
    getDownloadLink: jest.fn(),
  }

  const mockWalletModal = {
    open: jest.fn(),
    close: jest.fn(),
    modalIsOpen: false
  };

  beforeEach(() => {
    mockUseWalletManager.mockReturnValue(mockWalletManager);
    mockUseWalletModal.mockReturnValue(mockWalletModal);
  });

  it('should throw an error if chain does not exist', () => {
    mockWalletManager.getChainByName.mockReturnValue(undefined);

    expect(() => {
      renderHook(() => useChain('non-existent-chain'));
    }).toThrow(new ChainNameNotExist('non-existent-chain'));
  });

  it('should return correct values for an existing chain', () => {

    const mockChainWalletState: ChainWalletState = {
      walletState: WalletState.Connected,
      account: { username: 'test-user', address: 'test-address', algo: 'secp256k1' as const, pubkey: new Uint8Array() },
      errorMessage: '',
      rpcEndpoint: 'http://localhost:26657',
      chainName: 'test-chain',
      walletName: 'test-wallet'
    };

    mockWalletManager.getChainByName.mockReturnValue(mockChain);
    mockWalletManager.getChainWalletState.mockReturnValue(mockChainWalletState);
    mockWalletManager.getWalletByName.mockReturnValue(mockWallet);

    const { result } = renderHook(() => useChain('test-chain'));

    expect(result.current.chain).toEqual(mockChain);
    expect(result.current.status).toBe(WalletState.Connected);
    expect(result.current.username).toBe('test-user');
    expect(result.current.address).toBe('test-address');
    expect(result.current.rpcEndpoint).toBe('http://localhost:26657');
  });

  it('should call connect and open modal when connect is invoked', () => {

    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.connect();
    });

    expect(mockWalletManager.setCurrentChainName).toHaveBeenCalledWith('test-chain');
    expect(mockWalletModal.open).toHaveBeenCalled();
  });

  it('should call disconnect when disconnect is invoked', async () => {

    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    await act(async () => {
      await result.current.disconnect();
    });

    expect(mockWalletManager.disconnect).toHaveBeenCalledWith('test-wallet', 'test-chain');
  });

  it('should call open modal when openView is invoked', () => {

    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.openView();
    });

    expect(mockWalletManager.setCurrentChainName).toHaveBeenCalledWith('test-chain');
    expect(mockWalletModal.open).toHaveBeenCalled();
  });

  it('should call close modal when closeView is invoked', () => {

    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.closeView();
    });

    expect(mockWalletModal.close).toHaveBeenCalled();
  });
});