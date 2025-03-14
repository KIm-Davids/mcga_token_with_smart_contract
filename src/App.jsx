import { useEffect, useState } from "react";
import "./App.css";
import idl from './idl (1).json'
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed"
}
const { SystemProgram } = web3;

const userPublicKey = new PublicKey("8a8E9X7nkxZGNeMGXoFfrJRie8Zt4onXrsHVZ8zW7sqj")
const mintAddress = new PublicKey("mntd61DqWsLYpAR4VkXnqw6PeVbrLsr5Ajqrp9rSTZ8")


const App = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [amount, setAmount] = useState("");
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment
    )
    return provider;
  }

  const connectWallet = async () => {
    try {
      if ("solana" in window) {
        console.log("✅ Solana object detected:", window.solana);
        const { solana } = window;

        if (solana.isPhantom) {
          console.log("✅ Phantom Wallet Found");

          // Explicitly request user permission
          const response = await solana.connect();
          console.log("🔗 Connected with Public Key:", response.publicKey.toString());

          setWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        console.warn("❌ No Solana wallet found.");
        alert("Please install Phantom Wallet!");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if ("solana" in window) {
        console.log("✅ Checking if wallet is already connected...");
        const { solana } = window;

        if (solana.isPhantom) {
          console.log("✅ Phantom Wallet Found");

          // Try automatic connection
          const response = await solana.connect({ onlyIfTrusted: true });

          if (response.publicKey) {
            console.log("🔗 Auto-connected with Public Key:", response.publicKey.toString());
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
          }
        }
      }
    } catch (error) {
      console.warn("❌ Auto-connect failed. User may need to connect manually.");
    }
  };

  async function buyToken() {
    if(!window.Buffer){
      window.Buffer = Buffer;
    }

    if(!walletConnected) {
      console.warn("Wallet not connected")
      return
    }
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const toAccount = new PublicKey(walletAddress);

    console.log("🔗 From Account:", fromAccount.toBase58());

    
    const fromAccount = await getAssociatedTokenAddress(mintAddress, userPublicKey);
    const accountInfo = await provider.connection.getAccountInfo(fromAccount);


    try{
      const tx = await program.rpc.transaction({
        accounts: {
          fromAccount: fromAccount,
          toAccount: toAccount,
          mint: mintAddress,
          user: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID
        },
        signers: []
      });
      console.log("Transaction successful with signature: ", tx);
    } catch(error){
      console.error("Error buying token: ", error);
    }
  }

  useEffect(() => {
    console.log("🔄 Running useEffect...");
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
      <h1>Solana Wallet Checker</h1>
      {walletConnected ? (
        <p>✅ Connected: {walletAddress}</p>
      ) : (
        <p>❌ No wallet detected</p>
      )}
      {!walletConnected && <button onClick={connectWallet}>Connect Wallet</button>}
      {walletConnected && (
        <div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter Amount" />
          <button onClick={buyToken}>Buy Token</button>
        </div>
      )}
    </div>
  );
};

export default App;
