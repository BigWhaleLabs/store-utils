import { PersistableStore } from 'PersistableStore'
import { providers } from 'ethers'
import ContractSynchronizer, {
  ContractSynchronizerSchema,
} from 'helpers/ContractSynchronizer'
import Network from 'models/Network'
import transformObjectValues from 'helpers/transformObjectValues'

class ContractsStore extends PersistableStore {
  connectedAccounts: { [account: string]: ContractSynchronizer } = {}
  currentBlock?: number
  addressToTokenIds?: Promise<{ [address: string]: string[] } | undefined>

  get persistanceName() {
    return `${this.constructor.name}_${this.network}`
  }

  provider: providers.Provider
  network: Network

  constructor(provider: providers.Provider, network: Network) {
    super()
    this.provider = provider
    this.network = network
  }

  replacer = (key: string, value: unknown) => {
    const disallowList = ['addressToTokenIds']
    return disallowList.includes(key) ? undefined : value
  }

  reviver = (key: string, value: unknown) => {
    if (key === 'connectedAccounts') {
      return transformObjectValues(
        value as { [account: string]: ContractSynchronizerSchema },
        ContractSynchronizer.fromJSON
      )
    }
    return value
  }

  fetchBlockNumber() {
    return this.provider.getBlockNumber()
  }

  async fetchMoreContractsOwned(
    account: string,
    accountChange?: boolean,
    startBlock?: number
  ) {
    if (!this.currentBlock) this.currentBlock = await this.fetchBlockNumber()

    if (!this.connectedAccounts[account])
      this.connectedAccounts[account] = new ContractSynchronizer(
        account,
        startBlock
      )

    if (
      !this.addressToTokenIds &&
      this.connectedAccounts[account].mapAddressToTokenIds
    ) {
      this.addressToTokenIds = Promise.resolve(
        this.connectedAccounts[account].mapAddressToTokenIds
      )
    }

    const request = this.connectedAccounts[account].syncAddressToTokenIds(
      this.currentBlock,
      this.provider
    )

    this.addressToTokenIds =
      (this.addressToTokenIds && accountChange) || !this.addressToTokenIds
        ? request
        : Promise.resolve(await request)
  }
}

export default ContractsStore
