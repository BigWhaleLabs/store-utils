import { ETH_NETWORK, ETH_RPC } from '@big-whale-labs/constants'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnect from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'

const rpc = ETH_RPC
const network = ETH_NETWORK

export default function (appName: string) {
  return new Web3Modal({
    cacheProvider: true,
    theme: 'dark',
    disableInjectedProvider: false,
    network,
    providerOptions: {
      walletconnect: {
        package: WalletConnect,
        options: {
          rpc: {
            5: rpc,
          },
        },
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName,
          rpc: {
            5: rpc,
          },
          darkMode: true,
        },
      },
    },
  })
}
