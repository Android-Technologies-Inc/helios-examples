var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import MintNFT from '../components/MintNFT';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from "react";
import WalletInfo from '../components/WalletInfo';
import { Assets, Address, ByteArrayData, Cip30Wallet, ConstrData, hexToBytes, NetworkParams, Program, Value, TxOutput, Tx, WalletHelper } from "@hyperionbt/helios";
// The enableWallet() function will put the wallet's Cip30Handle here
//  once it has validated the user's wallet existence.
var g_Cip30Handle;
// The ID of the Cardano network currently selected in the user's
//  wallet will be placed here.
var g_NetworkId = null;
/**
 * Check if a string is empty or whitespace
 *
 * @param {string} str - The string to check
 *
 * @returns {boolean} - Returns TRUE if the string is "null", all
 *  whitespace, or of length zero, FALSE otherwise
 */
function isStringEmptyOrWhitespace(str) {
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
function positionOverElement(srcElement, trgElement) {
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
function setSpinnerAnimationText(newText) {
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
function showAnimationSpinner(newText) {
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
    document.querySelector(".spinner-container").style.color = "white";
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
function doAsyncWithBusyAnimation(funcAsync, spinnerText) {
    if (spinnerText === void 0) { spinnerText = 'Querying...'; }
    return __awaiter(this, void 0, void 0, function () {
        var retVal, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(funcAsync instanceof Promise))
                        throw new Error('The value in the funcAsync parameter is not a promise.');
                    if (isStringEmptyOrWhitespace(spinnerText))
                        throw new Error('The spinner text is empty or invalid.');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Show the animation spinner with the desired busy message.
                    showAnimationSpinner(spinnerText);
                    return [4 /*yield*/, funcAsync];
                case 2:
                    retVal = _a.sent();
                    hideAnimationSpinner();
                    return [2 /*return*/, retVal];
                case 3:
                    err_1 = _a.sent();
                    // Make sure the spinner animation is hidden.
                    hideAnimationSpinner();
                    // Let the caller deal with the error.
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
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
function updateNetworkId() {
    return __awaiter(this, void 0, void 0, function () {
        var bErrorOccurred, networkId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Make sure the CIP30Handle variable has been assigned.
                    if (g_Cip30Handle === null)
                        throw new Error("The CIP30Handle variable is unassigned.  Cannot get current network ID.");
                    bErrorOccurred = false;
                    return [4 /*yield*/, g_Cip30Handle.getNetworkId()
                            .catch(function (err) {
                            bErrorOccurred = true;
                            console.error("The following error occurred while trying to get the current network ID:");
                            console.error(err);
                        })];
                case 1:
                    networkId = _a.sent();
                    if (bErrorOccurred)
                        return [2 /*return*/, null];
                    else
                        return [2 /*return*/, networkId];
                    return [2 /*return*/];
            }
        });
    });
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
var Home = function () {
    var optimize = false;
    var networkParamsUrl = "https://d1t0d7c2nekuk0.cloudfront.net/".concat(selectedNetwork, ".json");
    var _a = useState(undefined), walletAPI = _a[0], setWalletAPI = _a[1];
    var _b = useState({ txId: "" }), tx = _b[0], setTx = _b[1];
    var _c = useState({ balance: "" }), walletInfo = _c[0], setWalletInfo = _c[1];
    var _d = useState(false), walletIsEnabled = _d[0], setWalletIsEnabled = _d[1];
    var _e = useState(), whichWalletSelected = _e[0], setWhichWalletSelected = _e[1];
    useEffect(function () {
        var checkWallet = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = setWalletIsEnabled;
                        return [4 /*yield*/, checkIfWalletFound()];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        }); };
        checkWallet();
    }, [whichWalletSelected]);
    useEffect(function () {
        var enableSelectedWallet = function () { return __awaiter(void 0, void 0, void 0, function () {
            var api, networkId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!walletIsEnabled) return [3 /*break*/, 3];
                        return [4 /*yield*/, enableWallet()];
                    case 1:
                        api = _a.sent();
                        setWalletAPI(api);
                        return [4 /*yield*/, doAsyncWithBusyAnimation(updateNetworkId())];
                    case 2:
                        networkId = (_a.sent());
                        console.warn("The ID of the Cardano network currently selected by the user is: ".concat(networkId));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        enableSelectedWallet();
    }, [walletIsEnabled, whichWalletSelected]);
    useEffect(function () {
        var updateWalletInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!walletIsEnabled) return [3 /*break*/, 2];
                        return [4 /*yield*/, doAsyncWithBusyAnimation(getBalance())];
                    case 1:
                        _balance = (_a.sent());
                        setWalletInfo(__assign(__assign({}, walletInfo), { balance: _balance }));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        updateWalletInfo();
    }, [walletAPI]);
    // user selects what wallet to connect to
    var handleWalletSelect = function (obj) {
        var whichWalletSelected = obj.target.value;
        setWhichWalletSelected(whichWalletSelected);
    };
    var checkIfWalletFound = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!whichWalletSelected)
                return [2 /*return*/, false];
            if (!window.cardano)
                return [2 /*return*/, false];
            return [2 /*return*/, !!window.cardano[whichWalletSelected]];
        });
    }); };
    var enableWallet = function () { return __awaiter(void 0, void 0, void 0, function () {
        var walletChoice, handle, walletAPI_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    walletChoice = whichWalletSelected;
                    if (!walletChoice)
                        return [2 /*return*/];
                    return [4 /*yield*/, window.cardano[walletChoice].enable()];
                case 1:
                    handle = _a.sent();
                    // Hoist the CIP30Handle up to a page level variable. We
                    //  will need it later to get the network ID.
                    g_Cip30Handle = handle;
                    walletAPI_1 = new Cip30Wallet(handle);
                    return [2 /*return*/, walletAPI_1];
                case 2:
                    err_2 = _a.sent();
                    console.log("enableWallet error", err_2);
                    setWhichWalletSelected(undefined);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getBalance = function () { return __awaiter(void 0, void 0, void 0, function () {
        var walletHelper, balanceAmountValue, balanceAmount, walletBalance, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    walletHelper = new WalletHelper(walletAPI);
                    return [4 /*yield*/, walletHelper.calcBalance()];
                case 1:
                    balanceAmountValue = _a.sent();
                    balanceAmount = balanceAmountValue.lovelace;
                    walletBalance = BigInt(balanceAmount);
                    return [2 /*return*/, walletBalance.toLocaleString()];
                case 2:
                    err_3 = _a.sent();
                    console.log("getBalance error: ", err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var mintNFT = function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var address, name, description, img, minAdaVal, walletHelper, utxos, changeAddr, colatUtxo, tx, mintScript, mintProgram, nftTokenName, tokens, mintRedeemer, networkParams, _a, signatures, txHash;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    address = params[0];
                    name = params[1];
                    description = params[2];
                    img = params[3];
                    minAdaVal = new Value(BigInt(2000000));
                    walletHelper = new WalletHelper(walletAPI);
                    return [4 /*yield*/, walletHelper.pickUtxos(minAdaVal)];
                case 1:
                    utxos = _b.sent();
                    return [4 /*yield*/, walletHelper.changeAddress];
                case 2:
                    changeAddr = _b.sent();
                    return [4 /*yield*/, walletHelper.pickCollateral()];
                case 3:
                    colatUtxo = _b.sent();
                    tx = new Tx();
                    // Add the UTXO as inputs
                    tx.addInputs(utxos[0]);
                    mintScript = "minting nft\n\n    const TX_ID: ByteArray = #" +
                        utxos[0][0].txId.hex +
                        "\n    const txId: TxId = TxId::new(TX_ID)\n    const outputId: TxOutputId = TxOutputId::new(txId, " +
                        utxos[0][0].utxoIdx +
                        ")\n    \n    func main(ctx: ScriptContext) -> Bool {\n        tx: Tx = ctx.tx;\n        mph: MintingPolicyHash = ctx.get_current_minting_policy_hash();\n    \n        assetclass: AssetClass = AssetClass::new(\n            mph, \n            \"" +
                        name +
                        "\".encode_utf8()\n        );\n        value_minted: Value = tx.minted;\n    \n        // Validator logic starts\n        (value_minted == Value::new(assetclass, 1)).trace(\"NFT:1 \") &&\n        tx.inputs.any((input: TxInput) -> Bool {\n                                        (input.output_id == outputId).trace(\"NFT2: \")\n                                        }\n        )\n    }";
                    mintProgram = Program.new(mintScript).compile(optimize);
                    // Add the script as a witness to the transaction
                    tx.attachScript(mintProgram);
                    nftTokenName = ByteArrayData.fromString(name).toHex();
                    tokens = [
                        [hexToBytes(nftTokenName), BigInt(1)],
                    ];
                    mintRedeemer = new ConstrData(0, []);
                    // Indicate the minting we want to include as part of this transaction
                    tx.mintTokens(mintProgram.mintingPolicyHash, tokens, mintRedeemer);
                    // Construct the output and include both the minimum Ada as well as the minted NFT
                    tx.addOutput(new TxOutput(Address.fromBech32(address), new Value(minAdaVal.lovelace, new Assets([[mintProgram.mintingPolicyHash, tokens]]))));
                    // Add the collateral utxo
                    tx.addCollateral(colatUtxo);
                    _a = NetworkParams.bind;
                    return [4 /*yield*/, fetch(networkParamsUrl).then(function (response) { return response.json(); })];
                case 4:
                    networkParams = new (_a.apply(NetworkParams, [void 0, _b.sent()]))();
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
                    return [4 /*yield*/, tx.finalize(networkParams, changeAddr)];
                case 5:
                    // Send any change back to the buyer
                    _b.sent();
                    console.log("tx after final", tx.dump());
                    console.log("Verifying signature...");
                    return [4 /*yield*/, walletAPI.signTx(tx)];
                case 6:
                    signatures = _b.sent();
                    tx.addSignatures(signatures);
                    console.log("Submitting transaction...");
                    return [4 /*yield*/, walletAPI.submitTx(tx)];
                case 7:
                    txHash = _b.sent();
                    console.log("txHash", txHash);
                    setTx({ txId: txHash.hex });
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className={styles.container}>
      <Head>
        <title>Helios Tx Builder</title>
        <meta name='description' content='Littercoin web tools page'/>
        <link rel='icon' href='/favicon.ico'/>
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
          {SUPPORTED_WALLETS.map(function (wallet) { return (<p key={wallet} className={styles.borderwallet}>
              <input type='radio' id={wallet} name='wallet' value={wallet} onChange={handleWalletSelect}/>
              <label>{wallet}</label>
            </p>); })}
        </div>
        {!tx.txId && walletIsEnabled && (<div className={styles.border}>
            <WalletInfo walletInfo={walletInfo}/>
          </div>)}
        {tx.txId && (<div className={styles.border}>
            <b>Transaction Success!!!</b>
            <p>
              TxId &nbsp;&nbsp;
              <a href={"https://".concat(selectedNetwork, ".cexplorer.io/tx/") + tx.txId} target='_blank' rel='noopener noreferrer'>
                {tx.txId}
              </a>
            </p>
            <p>
              Please wait until the transaction is confirmed on the blockchain
              and reload this page before doing another transaction
            </p>
          </div>)}
        {walletIsEnabled && !tx.txId && (<div className={styles.border}>
            <MintNFT onMintNFT={mintNFT}/>
          </div>)}
      </main>

      <footer className={styles.footer}></footer>
    </div>);
};
export default Home;
//# sourceMappingURL=index.jsx.map