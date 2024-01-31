import { SolanaAuth } from "./solana-auth";
import {
  BlockhashWithExpiryBlockHeight,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

/**
 * SPL Memo program ID
 */
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

type CreateAuthTransactionArgs = {
  /** connection to the desired cluster */
  connection: Connection;
  /** standard sign in message for signing */
  solanaAuth: SolanaAuth;
  /** fee payer for the transaction - defaults to `signInMessage.message.address` */
  feePayer?: PublicKey;
};

/**
 * Build a single memo instruction based transaction to support transaction based message signing
 * (like that of which is required by a Ledger)
 */
export async function createSolanaAuthTransaction({
  feePayer,
  connection,
  solanaAuth,
}: CreateAuthTransactionArgs) {
  let latestBlockhash: BlockhashWithExpiryBlockHeight;
  try {
    latestBlockhash = await connection.getLatestBlockhash();
  } catch (err) {
    throw Error("Unable to get latest blockhash");
  }

  // when not manually set, use the message's `address` as the `feePayer`
  if (!feePayer) feePayer = new PublicKey(solanaAuth.message.address);

  return new Transaction({
    feePayer,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(new TextEncoder().encode(solanaAuth.prepare())),
      keys: [],
    }),
  );
}
