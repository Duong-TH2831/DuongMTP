import CryptoJS from 'crypto-js';

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  invoiceId: string;
  invoiceCode: string;
  paymentMethod: string;
  amount: number;
  timestamp: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
}

export interface Block {
  index: number;
  timestamp: string;
  transactions: BlockchainTransaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export const BLOCKCHAIN_DIFFICULTY = 2; // Fixed difficulty for demo

export const calculateHash = (
  index: number,
  previousHash: string,
  timestamp: string,
  transactions: BlockchainTransaction[],
  nonce: number
): string => {
  return CryptoJS.SHA256(
    index + previousHash + timestamp + JSON.stringify(transactions) + nonce
  ).toString();
};

export const mineBlock = (block: Omit<Block, 'hash'>, difficulty: number): Block => {
  let nonce = 0;
  let hash = calculateHash(block.index, block.previousHash, block.timestamp, block.transactions, nonce);
  const target = Array(difficulty + 1).join('0');
  
  while (hash.substring(0, difficulty) !== target) {
    nonce++;
    hash = calculateHash(block.index, block.previousHash, block.timestamp, block.transactions, nonce);
  }
  
  return { ...block, nonce, hash };
};

export const createGenesisBlock = (): Block => {
  return mineBlock(
    {
      index: 0,
      timestamp: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      transactions: [],
      previousHash: '0',
      nonce: 0,
    },
    BLOCKCHAIN_DIFFICULTY
  );
};

export const isChainValid = (chain: Block[]): boolean => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    if (
      currentBlock.hash !==
      calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.nonce
      )
    ) {
      return false;
    }

    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }
  return true;
};

// Helper function to create a new block for a single transaction
export const createNextBlock = (previousBlock: Block, transaction: BlockchainTransaction): Block => {
  return mineBlock(
    {
      index: previousBlock.index + 1,
      timestamp: new Date().toISOString(), // Block mined time
      transactions: [transaction],
      previousHash: previousBlock.hash,
      nonce: 0,
    },
    BLOCKCHAIN_DIFFICULTY
  );
};
