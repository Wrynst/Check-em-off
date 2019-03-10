function openSheetObjectifiyData(ssid,sheetName){
  var ss = SpreadsheetApp.openById(ssid);
  var dataSheet = ss.getSheetByName(sheetName).getDataRange().getValues();
  return objectifySheet(dataSheet);
}
/**
 * objectifySheet
 *
 * @param  {string[][]} twoDeeArray - 2 dimensional array from getting all values off a sheet  
 * @return {string[]} obj - An array of string values, from a single header.  "A Column of cells" but gets rid of duplicates so not an accurate sample of data.
 */
function objectifySheet( twoDeeArray ) {
  //Logger.log(twoDeeArray);
  var headers      = twoDeeArray.shift() ;                 // pull off the first row that is the headers
  var fixedHeaders = normalizeHeaders( headers ) ;     //then "Normalize" them AKA format them in a way javascript can use them
   
  var obj = twoDeeArray.map( function ( values ) {
        return fixedHeaders.reduce( function ( o, k, i ) {
          o[k] = values[i];
          return o;
        }, {});
      });
  //Logger.log(obj);
  return obj;
}


/**
 * makeUniqueList 
 *
 * @param  {string} headerOfListWanted - A name of a column from the fixed headers var (ex: house, caseManager).
 * @param  {object} object2d - Data from sheet put into an object.  
 * @return {string[]} uniqueListArray - An array of string values, from a single header.  "A Column of cells" but gets rid of duplicates so not an accurate sample of data.
 */
function makeUniqueList ( headerOfListWanted, object2d) {
  var list = [];

  var obj = object2d//  objectifySheet ( twoDeeArray );
  
  // goes over each "row" and if there is the item you are looking for it adds it to the list array
  obj.forEach( function( row ) {
    if( row[ headerOfListWanted ] ) {
      list.push( row[ headerOfListWanted ].toString().trim() ); 
    }   
  });
    // filters out duplicates to create an array with only unique values borrowed from Sir Ben Collins
    // https://github.com/benlcollins/apps_script_apis/blob/master/api_009_gmail_service/api_009_gmail.gs
    var uniqueListArray = list.filter( function( item, pos ) {
    return list.indexOf( item ) == pos;
  }); 
   //Logger.log(uniqueListArray);
   return uniqueListArray;
}

/**
 * filterByValue
 * 
 * @param  {string} value4filter - Name of value to filter by. Example: 'HB2'.
 * @param  {string} keyOfValue - Name of key (header in this case) associated with value above. Example 'house'.
 * @param  {[string{}] objectifiedSheet - array of objects after turning sheet data into objectifiedSheet.
 * @return {html{}} html object returned 
 */
function filterByValue( value4filter, keyOfValue, objectifiedSheet){
  var object = objectifiedSheet;
  
  return object.filter( function( row ) { 
    return row[keyOfValue] === value4filter;
  }); 
}
/**
 * include
 *
 * @param  {string} filename - Name of file to include
 * @return {html{}} html object returned 
 */
function include(filename){
  var name = filename;
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function sentenceCase ( str ) {
  if ((str===null) || (str===''))
       return false;
  else
   str = str.toString();

 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// Returns an Array of normalized Strings.
// Empty Strings are returned for all Strings that could not be successfully normalized.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    keys.push(normalizeHeader(headers[i]));
    //Logger.log("string: "+headers[i]);
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case varter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var varter = header[i];
    if (varter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(varter)) {
      continue;
    }
    if (key.length == 0 && isDigit(varter)) {
      continue; // first character must be a varter
    }
    if (upperCase) {
      upperCase = false;
      key += varter.toUpperCase();
    } else {
      key += varter.toLowerCase();
    }
  }
  
  //Logger.log("header: "+key);
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}

