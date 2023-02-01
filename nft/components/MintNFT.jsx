import { useState } from 'react';
var mintNFT = function (_a) {
    var onMintNFT = _a.onMintNFT;
    var _b = useState(''), address = _b[0], setAddress = _b[1];
    var _c = useState(''), name = _c[0], setName = _c[1];
    var _d = useState(''), description = _d[0], setDescription = _d[1];
    var _e = useState(''), img = _e[0], setImg = _e[1];
    var onSubmit = function (e) {
        e.preventDefault(); // prevent full page refresh
        onMintNFT([address, name, description, img]);
    };
    return (<form onSubmit={onSubmit}>
            <div>
                <b>Destination Wallet Address</b> 
                <br></br>
                <input name='address' type='text' id='address' placeholder='Enter Destination Wallet Address' value={address} onChange={function (e) { return setAddress(e.target.value); }}/>
                <p></p>                 
            </div>
            <div>
                <b>NFT Token Name</b> 
                <br></br>
                <input name='name' type='text' id='name' placeholder='Enter NFT Token Name' value={name} onChange={function (e) { return setName(e.target.value); }}/>
                <p></p>
            </div>
            <div>
                <b>NFT Description</b> 
                <br></br>
                <input name='description' type='text' id='description' placeholder='Enter NFT Description' value={description} onChange={function (e) { return setDescription(e.target.value); }}/>
                <p></p>
            </div>
            <div>
                <b>NFT Image</b> 
                <br></br>
                <input name='img' type='text' id='img' placeholder='Enter NFT Image CID' value={img} onChange={function (e) { return setImg(e.target.value); }}/>
                <p></p>
            </div>
            <br></br>                   
            <input type='submit' value='Mint NFT'/>
        </form>);
};
export default mintNFT;
//# sourceMappingURL=MintNFT.jsx.map