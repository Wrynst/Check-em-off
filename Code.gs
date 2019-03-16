var ssidInc          = '1i4bbdjqH5Riggea3TYDQykvVmDdY7mYaevQFEFUoYjw';
var ssidOut          = '1nnhY28LQuz8EBUMnkQWZn6IFfOv4qSD-1X9n_k9Ve3A';
var ssOut            = SpreadsheetApp.openById(ssidOut);

var incoming         = openSheetObjectifiyData(ssidInc,  'What Is needed');
var options          = openSheetObjectifiyData(ssidOut,         'Options');

var houseList        = makeUniqueList('house',               incoming);
var nameList         = makeUniqueList('name',                incoming);

var amCrit           = makeUniqueList('criteriaAm',           options);
var pmCrit           = makeUniqueList('criteriaPm',           options);   
var empNames         = makeUniqueList('employeeNames',        options);
var empAmCrit        = makeUniqueList('empCriteriaAm',        options);
var empPmCrit        = makeUniqueList('empCriteriaPm',        options);
var cutOffTime       = makeUniqueList('amPmSwitch',           options);
var sliders          = makeUniqueList('sliders',              options);
var textAPlaceH      = makeUniqueList('textareaPlaceholders', options);
var submitEmails       = makeUniqueList('sendEmail',            options);

var dataIncNoEmpties = incoming.filter(function(row) { return row['name'] && row['house']});
var today = new Date();
var ampm = today.getHours(); 
var hName = "";
var user = Session.getActiveUser().getEmail();

function doGet() {
  
  return HtmlService.createTemplateFromFile('index')
                    .evaluate()
                    .setTitle('OPS ☑')
                    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
                    .setFaviconUrl("https://arnold.systems/img/coastline-1024n.png");
}

var emp = true;
function checkTime(emp){
  if(emp){
    return ampm > cutOffTime[0] ? empPmCrit : empAmCrit;
  }else{
    return ampm > cutOffTime[0] ? pmCrit : amCrit;
  }
}
var ampmFlag = (ampm > cutOffTime[0] ? "PM" : "AM");
  
var empChecks;
/**
 * getData
 *
 *
 * @return {string} HTML output for The cards
**/
function getData() {
  return houseList.map ( function ( houseName ) {
    hName = houseName.toString(); 
    
    var lastPart = '';
    var empCard;
    var textAreas = textAPlaceH.map(function(tArea){ return '<textarea class="prompts w3-card" size="100" placeholder="'+tArea+'" name="'+tArea+'"></textarea><br>'}).join('');
    var commentAndSubmitButton = '<div id="submit-checks'+ hName +'" class="w3-container w3-animate-left" style="display:none">'+textAreas+'<button class="w3-button w3-green w3-round" onclick="sendChecks('+ hName.toString() +')"><span class="mdi mdi-checkbox-multiple-marked-outline"> Submit</span></button></form></div>';
    
    var tabby =  '<div id="'+houseName+'" class="w3-container ncard w3-animate-left" style="display:none">';
      var inside = dataIncNoEmpties.map ( function ( row ) { 
        if ( row.house === houseName ) {
          var div = '<div class="w3-card item"><header class="w3-container item-header"><h2>'+ row.name +'</h2></header><div class="w3-container item-content"><form>';
          var empDiv = '<div class="w3-card item"><header class="w3-container emp-header"><h3>'+today.toDateString()+'</h3></header><div class="w3-container item-content"><form><h6>'+(ampm > cutOffTime[0] ? "PM Schedule" : "AM Schedule")+'</h6>';
          var sliderHTML = sliders.map(function(topic){ return '<h5>'+topic+' <span class="num">3</span></h5><div class="slidecontainer"><input type="range" min="1" max="5" value="3" label="'+topic+'" class="slider myRange" oninput="slid(this)" name="'+row.name+'"></div>'}).join('');
          var checkboxes = checkTime().map ( function ( r ) { 
            return '<label class="container '+hName+'">'+ r +'<br><input type="checkbox" name="'+ row.name +'" value="'+ r +'"><span class="checkmark"></span></label>' }).join('');
          var empChecks = checkTime(emp).map(function(empCheckBox) {
            return '<label class="container '+hName+'">'+ empCheckBox +'<br><input type="checkbox" name="'+ user +'" value="'+ empCheckBox +'"><span class="checkmark"></span></label>'}).join('');
          var cardFooter = '</div><footer class="w3-container item-footer"><span class="mdi mdi-hotel"> '+ row.bed +'</span>  |  <span class="mdi mdi-briefcase-account"> ' + row.caseManager + '</span>  |  <span class="mdi mdi-home">' + row.house + '</span></footer></div>';
          var empFooter = '</div><footer class="w3-container emp-footer">'+ user +'</footer></div>';
          empCard = empDiv + empChecks + empFooter;
          lastPart = div + sliderHTML + '<hr/>' + checkboxes + cardFooter;
          return lastPart;
        }
      }).join('');
    return tabby + inside + empCard + commentAndSubmitButton + '</div>';
  }).join('');
}

function submitEmail(emailData){
  var emailDataSheet = ssOut.getSheetByName('results2');
  pusher = [];
  pusher.push(today, emailData[0].name, emailData[0].house);
  emailData.forEach(function(entry){
    pusher.push(entry.criteria, entry.value);
  });
  emailDataSheet.appendRow(pusher);
  
  var emailBodyData = pusher.toString();
  var body = "Hello!  If you have received this email, you have been selected to beta test Emily's App! May fortune continue to smile upon you and grant a bountiful inbox! " + emailBodyData;
  submitEmails.forEach(function(email){
  
    MailApp.sendEmail(email, "💤 Don't sleep on this news!" , body);
    
  });
  return true
}

/*
 *
 *
**/
function submitChecks(payload){
  var ss = SpreadsheetApp.openById(ssidOut);                 //
  var sheet = ss.getSheetByName('results');
   
  var nameListH  = makeUniqueList('name', payload);
      
    nameListH.forEach(function(name){ 
      var pusher = [];
      pusher.push(new Date(), user, payload[0].house, name);
      payload.forEach(function(pay){
       
      if(pay.name === name){
        pusher.push(pay.criteria, pay.value)
      }        
    });
  sheet.appendRow(pusher);
  });  
}

function makeNavButtons() {
  var houseLinks = houseList.map ( function ( house ) {
    return '<button class="w3-bar-item w3-button tablink" onclick="openLink(event, ' + '\''+house+'\'' + ') " > '+ house +'</button>'  //escape the ' like \'  AND DONT leave spaces between quotes and vars!
  }).join('');
                   //fill this in when you get more links!
  return houseLinks;
}


function test(){
 // Logger.log(HtmlService.createTemplateFromFile('index').getCode());
  Logger.log(ampmFlag);
}
