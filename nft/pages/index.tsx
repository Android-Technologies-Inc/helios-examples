
import MintNFT from '../components/MintNFT';
import Head from 'next/head'
import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from "react";
import WalletInfo from '../components/WalletInfo';
import {
  Assets,
  Address, 
  ByteArrayData,
  Cip30Handle,
  Cip30Wallet,
  ConstrData, 
  hexToBytes, 
  NetworkParams,
  Program,
  Value, 
  TxOutput,
  Tx,
  WalletHelper} from "@hyperionbt/helios";

declare global {
  interface Window {
      cardano:any;
  }
}

// The enableWallet() function will put the wallet's Cip30Handle here
//  once it has validated the user's wallet existence.
let g_Cip30Handle: Cip30Handle;

// The ID of the Cardano network currently selected in the user's
//  wallet will be placed here.
let g_NetworkId = null;

/**
 * Check if a string is empty or whitespace
 *
 * @param {string} str - The string to check
 *
 * @returns {boolean} - Returns TRUE if the string is "null", all
 *  whitespace, or of length zero, FALSE otherwise
 */
function isStringEmptyOrWhitespace(str: string) {
  // validate the input parameter
  if (typeof str !== 'string') {
    throw new Error('Input must be of type string');
  }

  // return true if the string is "null" or of length zero after trimming
  return str === null || str.trim().length < 1;
}

/**
 * Positions the target DOM element directly over the source DOM element.
 *
 * @param {HTMLElement} srcElement - The source DOM element.
 * @param {HTMLElement} trgElement - The target DOM element.
 */
function positionOverElement(srcElement: object, trgElement: object) {
  if (!srcElement || !trgElement)
    throw new Error("Both source and target elements are required");

  trgElement.style.position = "absolute";
  trgElement.style.left = srcElement.offsetLeft + "px";
  trgElement.style.top = srcElement.offsetTop + "px";
}

/**
 * Set the text that will be shown next to the animation spinner.
 *
 * @param {string} newText - The string to check
 *
 */
function setSpinnerAnimationText(newText: string) {
  if (isStringEmptyOrWhitespace(newText))
    throw new Error('The animation spinner text is empty or invalid');

  // update the text that will be shown in the spinner animation
  document.querySelector(".spinner-text").textContent = newText;
}

/**
 * Show the animation spinner
 *
 * @param {string} newText - The string to check
 */
function showAnimationSpinner(newText: string) {
  if (!isStringEmptyOrWhitespace(newText))
    setSpinnerAnimationText(newText);

  document.querySelector(".spinner-container").style.display = "flex";

  // TODO: Remove this code and put it in the main CSS file once we figure
  //  out why our style modifications in the fil are not showing up
  //  during run-time.
  document.querySelector(".spinner-container").style.position = "absolute";
  document.querySelector(".spinner-container").style.left = "50%";
  document.querySelector(".spinner-container").style.top = "50%";
  document.querySelector(".spinner-container").style.transform = "translate(-50%, -50%)";
  document.querySelector(".spinner-container").style.color  = "white";
  document.querySelector(".spinner-container").style.background = "blue";

}

/**
 * Hide the animation spinner
 */
function hideAnimationSpinner() {
  document.querySelector(".spinner-container").style.display = "none";
}

/**
 * This function wraps an async call (promise) so that the busy
 *  animation is shown before the call is made, and hidden
 *  when the call is done (or errors our).
 *
 * @param {Promise} funcAsync - The async function to call.
 * @param {string} spinnerText - The busy animaton message
 *  that will be displayed next to the spinner animation.
 *
 * @returns {Promise<*>}
 */
async function doAsyncWithBusyAnimation(funcAsync: Promise<any>, spinnerText: string = 'Querying...') {
  if (!(funcAsync instanceof  Promise))
    throw new Error('The value in the funcAsync parameter is not a promise.');
  if (isStringEmptyOrWhitespace(spinnerText))
    throw new Error('The spinner text is empty or invalid.')

  try {
    // Show the animation spinner with the desired busy message.
    showAnimationSpinner(spinnerText);

    // Make the async call.
    const retVal = await funcAsync;

    hideAnimationSpinner();
    return retVal;
  } catch (err) {
    // Make sure the spinner animation is hidden.
    hideAnimationSpinner();

    // Let the caller deal with the error.
    throw err;
  }
}

/**
 * Get the ID of the Cardano network currently selected in the
 *  user's wallet.
 *
 * NOTE: This function should not be called before the wallet
 *  has been enabled!
 *
 * @return {number|null} - If successful this function returns
 *  the numeric ID of the wallet currently selected by the user.
 *  If an error occurred, then NULL is returned.
 */
async function updateNetworkId() {
  // Make sure the CIP30Handle variable has been assigned.
  if (g_Cip30Handle === null)
    throw new Error(`The CIP30Handle variable is unassigned.  Cannot get current network ID.`);

  let bErrorOccurred = false;

  const networkId = await g_Cip30Handle.getNetworkId()
      .catch(err => {
        bErrorOccurred = true;

        console.error(`The following error occurred while trying to get the current network ID:`);
        console.error(err);
      });

  if (bErrorOccurred)
    return null;
  else
    return networkId;
}

/*
 This sets the selected Cardano network.  Valid values are:

  preprod    - The preview production network
  preview    - The preview test network
  mainnet    - The main network

  WARNING: If this value doesn't match what network the user currently
    has selected in their wallet, you end up with a contextually corrupt
    processing environment.
 */
export var selectedNetwork = 'preview';
export var SUPPORTED_WALLETS = [
  "nami",
  "flint",
  "eternl",
  "Fake - Does not exist",
];

export type SUPPORTED_WALLETS_TYPE = typeof SUPPORTED_WALLETS[number];

const Home: NextPage = () => {
  const optimize = false;
  const networkParamsUrl = `https://d1t0d7c2nekuk0.cloudfront.net/${selectedNetwork}.json`;
  const [walletAPI, setWalletAPI] = useState<undefined | any>(undefined);
  const [tx, setTx] = useState({ txId: "" });
  const [walletInfo, setWalletInfo] = useState({ balance: "" });
  const [walletIsEnabled, setWalletIsEnabled] = useState(false);
  const [whichWalletSelected, setWhichWalletSelected] =
    useState<SUPPORTED_WALLETS_TYPE>();

  useEffect(() => {
    const checkWallet = async () => {
      setWalletIsEnabled(await checkIfWalletFound());
    };
    checkWallet();
  }, [whichWalletSelected]); 

  useEffect(() => {
    const enableSelectedWallet = async () => {
      if (walletIsEnabled) {
        const api = await enableWallet();
        setWalletAPI(api);

        // Get the active network ID.
        const networkId = (await doAsyncWithBusyAnimation(updateNetworkId())) as string;
        console.warn(`The ID of the Cardano network currently selected by the user is: ${networkId}`);
      }
    };
    enableSelectedWallet();
  }, [walletIsEnabled, whichWalletSelected]);

  useEffect(() => {
    const updateWalletInfo = async () => {
        if (walletIsEnabled) {
        const _balance = (await doAsyncWithBusyAnimation(getBalance())) as string;
            setWalletInfo({
              ...walletInfo,
          balance: _balance,
            });
        }           
    };
    updateWalletInfo();
  }, [walletAPI]);

  // user selects what wallet to connect to
  const handleWalletSelect = (obj : any) => {
    const whichWalletSelected = obj.target.value;
    setWhichWalletSelected(whichWalletSelected);
  };

  const checkIfWalletFound = async () => {
    if (!whichWalletSelected) return false;
      
    if (!window.cardano) return false;

    return !!window.cardano[whichWalletSelected];
  };

  const enableWallet = async () => {
      try {
        const walletChoice = whichWalletSelected;

        if (!walletChoice) return;

        const handle: Cip30Handle = await window.cardano[walletChoice].enable();

        // Hoist the CIP30Handle up to a page level variable. We
        //  will need it later to get the network ID.
        g_Cip30Handle = handle;

        const walletAPI = new Cip30Wallet(handle);

        return walletAPI;
      } catch (err) {
        console.log("enableWallet error", err);
        setWhichWalletSelected(undefined);
      }
  };

  const getBalance = async () => {
    try {
        const walletHelper = new WalletHelper(walletAPI);
        const balanceAmountValue  = await walletHelper.calcBalance();
        const balanceAmount = balanceAmountValue.lovelace;
        const walletBalance : BigInt = BigInt(balanceAmount);
        return walletBalance.toLocaleString();
    } catch (err) {
      console.log("getBalance error: ", err);
  }
  };

  const mintNFT = async (params : any) => {
    const address = params[0];
    const name = params[1];
    const description = params[2];
    const img = params[3];
    const minAdaVal = new Value(BigInt(2000000));  // minimum Ada needed to send an NFT

    // Get wallet UTXOs
    const walletHelper = new WalletHelper(walletAPI);
    const utxos = await walletHelper.pickUtxos(minAdaVal);
 
    // Get change address
    const changeAddr = await walletHelper.changeAddress;

    // Determine the UTXO used for collateral
    const colatUtxo = await walletHelper.pickCollateral();

    // Start building the transaction
    const tx = new Tx();

    // Add the UTXO as inputs
    tx.addInputs(utxos[0]);

    const mintScript =
      `minting nft

    const TX_ID: ByteArray = #` +
      utxos[0][0].txId.hex +
      `
    const txId: TxId = TxId::new(TX_ID)
    const outputId: TxOutputId = TxOutputId::new(txId, ` +
      utxos[0][0].utxoIdx +
      `)
    
    func main(ctx: ScriptContext) -> Bool {
        tx: Tx = ctx.tx;
        mph: MintingPolicyHash = ctx.get_current_minting_policy_hash();
    
        assetclass: AssetClass = AssetClass::new(
            mph, 
            "` +
      name +
      `".encode_utf8()
        );
        value_minted: Value = tx.minted;
    
        // Validator logic starts
        (value_minted == Value::new(assetclass, 1)).trace("NFT:1 ") &&
        tx.inputs.any((input: TxInput) -> Bool {
                                        (input.output_id == outputId).trace("NFT2: ")
                                        }
        )
    }`;
    
    // Compile the helios minting script
    const mintProgram = Program.new(mintScript).compile(optimize);

    // Add the script as a witness to the transaction
    tx.attachScript(mintProgram);

    // Construct the NFT that we will want to send as an output
    const nftTokenName = ByteArrayData.fromString(name).toHex();
    const tokens: [number[], bigint][] = [
      [hexToBytes(nftTokenName), BigInt(1)],
    ];

    // Create an empty Redeemer because we must always send a Redeemer with
    // a plutus script transaction even if we don't actually use it.
    const mintRedeemer = new ConstrData(0, []);

    // Indicate the minting we want to include as part of this transaction
    tx.mintTokens(mintProgram.mintingPolicyHash, tokens, mintRedeemer);

    // Construct the output and include both the minimum Ada as well as the minted NFT
    tx.addOutput(
      new TxOutput(
      Address.fromBech32(address),
        new Value(
          minAdaVal.lovelace,
          new Assets([[mintProgram.mintingPolicyHash, tokens]])
        )
      )
    );

    // Add the collateral utxo
    tx.addCollateral(colatUtxo);

    const networkParams = new NetworkParams(
      await fetch(networkParamsUrl).then((response) => response.json())
    );

    // Attached the metadata for the minting transaction
    tx.addMetadata(721, {
      map: [
        [
          mintProgram.mintingPolicyHash.hex,
          {
            map: [
              [
                name,
                                      {
                  map: [
                    ["name", name],
                                                ["description", description],
                    ["image", img],
                  ],
                },
              ],
            ],
          },
        ],
      ],
    });

    console.log("tx before final", tx.dump());

    // Send any change back to the buyer
    await tx.finalize(networkParams, changeAddr);
    console.log("tx after final", tx.dump());

    console.log("Verifying signature...");
    const signatures = await walletAPI.signTx(tx);
    tx.addSignatures(signatures);
    
    console.log("Submitting transaction...");
    const txHash = await walletAPI.submitTx(tx);
    
    console.log("txHash", txHash);
    setTx({ txId: txHash.hex });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Helios Tx Builder</title>
        <meta name='description' content='Littercoin web tools page' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* container for the spinner animation */}
      <div className="spinner-container">
        {/* the spinner itself */}
        <div className="spinner"></div>
        {/* the text next to the spinner */}
        <div className="spinner-text"></div>
      </div>

      <main className={styles.main}>
        <h3 className={styles.title}>Helios Tx Builder</h3>
   
        <div className={styles.borderwallet}>
          <p>Connect to your wallet</p>
          {SUPPORTED_WALLETS.map((wallet) => (
            <p key={wallet} className={styles.borderwallet}>
              <input
                type='radio'
                id={wallet}
                name='wallet'
                value={wallet}
                onChange={handleWalletSelect}
              />
              <label>{wallet}</label>
            </p>
          ))}
        </div>
        {!tx.txId && walletIsEnabled && (
          <div className={styles.border}>
            <WalletInfo walletInfo={walletInfo} />
          </div>
        )}
        {tx.txId && (
          <div className={styles.border}>
            <b>Transaction Success!!!</b>
            <p>
              TxId &nbsp;&nbsp;
              <a
                href={`https://${selectedNetwork}.cexplorer.io/tx/` + tx.txId}
                target='_blank'
                rel='noopener noreferrer'
              >
                {tx.txId}
              </a>
            </p>
            <p>
              Please wait until the transaction is confirmed on the blockchain
              and reload this page before doing another transaction
            </p>
          </div>
        )}
        {walletIsEnabled && !tx.txId && (
          <div className={styles.border}>
            <MintNFT onMintNFT={mintNFT} />
          </div>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home