function find_duplicate_in_array(arra1) {
    var object = {};
    var result = [];

    arra1.forEach(function (item) {
      if(!object[item])
          object[item] = 0;
        object[item] += 1;
    })

    for (var prop in object) {
       if(object[prop] >= 2) {
           result.push(prop);
       }
    }

    return result;

}

// to check duplicateItem exists or not
function checkIfDuplicateExists(w){
    return new Set(w).size !== w.length 
}

//to check mad id is multicast or not
function toCheckMulticastMACAddress(macAddress) {
    var firstOctet = (macAddress).split(":")[0];
    var checkLastBit = ("00000000" + (parseInt(firstOctet, 16)).toString(2)).substr(-8);
    return (checkLastBit[checkLastBit.length - 1])
}


module.exports = {
    checkIfDuplicateExists:checkIfDuplicateExists,
    duplicateItems:find_duplicate_in_array,
    toCheckMulticastMACAddress:toCheckMulticastMACAddress
}