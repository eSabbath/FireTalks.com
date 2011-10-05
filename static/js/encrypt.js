IncludeJavaScript('aes.js');
IncludeJavaScript('entropy.js');
IncludeJavaScript('aesprng.js');
IncludeJavaScript('md5.js');
IncludeJavaScript('armour.js');
IncludeJavaScript('utf-8.js');

//	    For details, see http://www.fourmilab.ch/javascrypt/

var loadTime = (new Date()).getTime();  // Save time page was loaded
var key;	    	    	    	    // Key (byte array)
var prng;	    	    	    	    // Pseudorandom number generator
        
    //	setKey  --  Set key from string or hexadecimal specification

function encryptText(sourceText, sourceKey)
{
	var v, i;
	
    setKey(sourceKey);

	addEntropyTime();
    	prng = new AESprng(keyFromEntropy());
	var plaintext = encode_utf8(sourceText);
	
	//  Compute MD5 sum of message text and add to header
	
	md5_init();
	for (i = 0; i < plaintext.length; i++) {
	    md5_update(plaintext.charCodeAt(i));
	}
	md5_finish();
	var header = "";
	for (i = 0; i < digestBits.length; i++) {
	    header += String.fromCharCode(digestBits[i]);
	}
	
	//  Add message length in bytes to header
	
	i = plaintext.length;
	header += String.fromCharCode(i >>> 24);
	header += String.fromCharCode(i >>> 16);
	header += String.fromCharCode(i >>> 8);
	header += String.fromCharCode(i & 0xFF);

	var ct = rijndaelEncrypt(header + plaintext, key, "CBC");

	v = armour_base64(ct);

	delete prng;
		
	return v;
}


    
function setKey(sourceKey) 
{
	var s = encode_utf8(sourceKey);
	var i, kmd5e, kmd5o;

	if (s.length == 1) {
		s += s;
	}

	md5_init();
	for (i = 0; i < s.length; i += 2) {
		md5_update(s.charCodeAt(i));
	}
	md5_finish();
	kmd5e = byteArrayToHex(digestBits);

	md5_init();
	for (i = 1; i < s.length; i += 2) {
		md5_update(s.charCodeAt(i));
	}
	md5_finish();
	kmd5o = byteArrayToHex(digestBits);

	var hs = kmd5e + kmd5o;
	key =  hexToByteArray(hs);
	hs = byteArrayToHex(key);
}

function Decrypt_text(sourceText, sourceKey) 
{

    	setKey(sourceKey);
	var ct = new Array(), kt;
	kt = determineArmourType(sourceText);
    	if (kt == 0) {
    	    ct = disarm_codegroup(sourceText);
	} else if (kt == 1) {
    	    ct = disarm_hex(sourceText);
	} else if (kt == 2) {
    	    ct = disarm_base64(sourceText);
	}

	var result = rijndaelDecrypt(ct, key, "CBC");
	
	var header = result.slice(0, 20);
	result = result.slice(20);
	
	/*  Extract the length of the plaintext transmitted and
	    verify its consistency with the length decoded.  Note
	    that in many cases the decrypted messages will include
	    pad bytes added to expand the plaintext to an integral
	    number of AES blocks (blockSizeInBits / 8).  */
	
	var dl = (header[16] << 24) | (header[17] << 16) | (header[18] << 8) | header[19];
    	if ((dl < 0) || (dl > result.length)) {
	    alert("Message (length " + result.length + ") truncated.  " +
	    	dl + " characters expected.");
	    //	Try to sauve qui peut by setting length to entire message
    	    dl = result.length;
	}
	
	/*  Compute MD5 signature of message body and verify
	    against signature in message.  While we're at it,
	    we assemble the plaintext result string.  Note that
	    the length is that just extracted above from the
	    message, *not* the full decrypted message text.
	    AES requires all messages to be an integral number
	    of blocks, and the message may have been padded with
	    zero bytes to fill out the last block; using the
	    length from the message header elides them from
	    both the MD5 computation and plaintext result.  */
	    
	var i, plaintext = "";
	
	md5_init();
	for (i = 0; i < dl; i++) {
	    plaintext += String.fromCharCode(result[i]);
	    md5_update(result[i]);
	}
	md5_finish();

	for (i = 0; i < digestBits.length; i++) {
	    if (digestBits[i] != header[i]) {
	    	alert("Message corrupted.  Checksum of decrypted message does not match.");
		break;
	    }
	}
	
	//  That's it; plug plaintext into the result field
	
	var result = decode_utf8(plaintext);
	return result;
    }


function determineArmourType(s) {
    	var kt, pcg, phex, pb64, pmin;
	
	pcg = s.indexOf(codegroupSentinel);
	phex = s.indexOf(hexSentinel);
	pb64 = s.indexOf(base64sent);
	if (pcg == -1) {
	    pcg = s.length;
	}
	if (phex == -1) {
	    phex = s.length;
	}
	if (pb64 == -1) {
	    pb64 = s.length;
	}
	pmin = Math.min(pcg, Math.min(phex, pb64));
	if (pmin < s.length) {
	    if (pmin == pcg) {
	    	kt = 0;
	    } else if (pmin == phex) {
	    	kt = 1;
	    } else {
	    	kt = 2;
	    }
	} else 
	{

    	kt = 2;
	}
	return kt;
    }
	
	
function IncludeJavaScript(jsFile)
{
  document.write('<script type="text/javascript" src="/static/js/encr/'
    + jsFile + '"></scr' + 'ipt>'); 
}
