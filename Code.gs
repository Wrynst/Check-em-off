var ssidInc          = '1i4bbdjqH5Riggea3TYDQykvVmDdY7mYaevQFEFUoYjw';
var ssidOut          = '1nnhY28LQuz8EBUMnkQWZn6IFfOv4qSD-1X9n_k9Ve3A';
var ssOut            = SpreadsheetApp.openById(ssidOut);


var incoming         = openSheetObjectifiyData(ssidInc,  'What Is needed');
var options          = openSheetObjectifiyData(ssidOut,         'Options');


var houseList        = makeUniqueList(  'house',               incoming);
var nameList         = makeUniqueList(  'name',                incoming);

var amCrit           = makeUniqueList(  'criteriaAm',           options);
var pmCrit           = makeUniqueList(  'criteriaPm',           options);   
var empNames         = makeUniqueList(  'employeeNames',        options);
var empAmCrit        = makeUniqueList(  'empCriteriaAm',        options);
var empPmCrit        = makeUniqueList(  'empCriteriaPm',        options);
var cutOffTime       = makeUniqueList(  'amPmSwitch',           options);
var sliders          = makeUniqueList(  'sliders',              options);
var textAPlaceH      = makeUniqueList(  'textareaPlaceholders', options);
var submitEmails     = makeUniqueList(  'sendEmail',            options);

var dataIncNoEmpties = incoming.filter(function(row) { return row['name'] && row['house']});
var today            = new Date();
var ampm             = today.getHours(); 
var dateOnly         = today.toDateString();
var hName            = "";
var user             = Session.getActiveUser().getEmail();

var coastlineLogoUrl        = "https://coastlinerehabcenters.com/wp-content/uploads/2017/05/rehabcentersorangecounty-huntingtonbeachdrugtreatment-hp.png";
var wrynstcrownUrl          = "https://wrynst.com//bl-themes/bluma-3.2/img/wrynst-c-128.png";
var coastlineLogoBlob       = UrlFetchApp
                            .fetch(coastlineLogoUrl)
                            .getBlob()
                            .setName("coastlineLogoBlob");
var wrynstcrownBlob         = UrlFetchApp
                            .fetch(wrynstcrownUrl)
                            .getBlob()
                            .setName("wrynstcrownBlob");

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
var ampmFlag    = (ampm > cutOffTime[0] ? "PM" : "AM");
var ampmEmoji   = (ampmFlag === 'PM' ? '🌛' : '🌞');
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
    
    var lastPart         = '';
    var empCard;
    var textAreas              = textAPlaceH.map( function( tArea ){ return '<textarea class="prompts w3-card" size="100" placeholder="'+ tArea +'" name="'+ tArea +'"></textarea><br>'}).join('');
    var commentAndSubmitButton = '<div id="submit-checks'+ hName +'" class="w3-container w3-animate-left" style="display:none">'+ textAreas +'<button class="w3-button w3-green w3-round" onclick="sendChecks('+ hName.toString() +')"><span class="mdi mdi-checkbox-multiple-marked-outline"> Submit</span></button></form></div>';
    
    var tabby            = '<div id="'+houseName+'" class="w3-container ncard w3-animate-left" style="display:none">';
      var inside         = dataIncNoEmpties.map ( function ( row ) { 
        
        if ( row.house === houseName ) {
          var div        = '<div class="w3-card item"><header class="w3-container item-header"><h2>'+ row.name +'</h2></header><div class="w3-container item-content"><form>';
          var empDiv     = '<div class="w3-card item"><header class="w3-container emp-header"><h3>'+ today.toDateString() +'</h3></header><div class="w3-container item-content"><form><h6>'+ ( ampm > cutOffTime[0] ? "PM Schedule" : "AM Schedule")+'</h6>';
          
          var sliderHTML = sliders.map( function( topic ){ 
            return '<h5>'+topic+' <span class="num">3</span></h5><div class="slidecontainer"><input type="range" min="1" max="5" value="3" label="'+ topic +'" class="slider myRange" oninput="slid(this)" name="'+row.name+'"></div>'}).join('');
          
          var checkboxes = checkTime().map ( function( r ) { 
            return '<label class="container '+hName+'">'+ r +'<br><input type="checkbox" name="'+ row.name +'" value="'+ r +'"><span class="checkmark"></span></label>' }).join('');
          
          var empChecks  = checkTime(emp).map( function( empCheckBox ) {
            return '<label class="container '+hName+'">'+ empCheckBox +'<br><input type="checkbox" name="'+ user +'" value="'+ empCheckBox +'"><span class="checkmark"></span></label>'}).join('');
          
          var cardFooter = '</div><footer class="w3-container item-footer"><span class="mdi mdi-hotel"> '+ row.bed +'</span>  |  <span class="mdi mdi-briefcase-account"> ' + row.caseManager + '</span>  |  <span class="mdi mdi-home">' + row.house + '</span></footer></div>';
          var empFooter  = '</div><footer class="w3-container emp-footer">'+ user +'</footer></div>';
          
          empCard        = empDiv + empChecks + empFooter;
          lastPart       = div + sliderHTML + '<hr/>' + checkboxes + cardFooter;
          
          return lastPart;
        }
      }).join('');
    return tabby + inside + empCard + commentAndSubmitButton + '</div>';
  }).join('');
}


// This builds the HTML email and then sends it out.  It also Appends the data to results2 sheet. I should probably refactor..
function submitEmail(rangerTexterEC){
  var temp = rangerTexterEC;
  Logger.log(temp[1][0]);
  var textAreasSheet     = ssOut.getSheetByName('results2');
  
  var results1           = temp[0];  // results 1 all the individual Client cards
  var textAreas          = temp[1];  // textAreas shows up on results2 
  var empChecks          = temp[2];  // employee checkboxes for daily duties results2
  
  var pusher             = [];  // for pushing, of course!
  
  // Starts the sheet entry with a timestamp, the person's email submitting, and the house being submitted
  pusher.push(today, empChecks[0].name, empChecks[0].house);
  
  // Makes an array of client objects for the ones currently in the house that is being submitted
  var ctInHouse = dataIncNoEmpties.filter(function(client){ return client.house === results1[0].house });
  
  // the data from the employee
  function mapTop(rangerTexterArray){
    var mapTop = rangerTexterArray.map(function(question){
      pusher.push(question.criteria, question.value);  //while I'm looping here I take advantage and push my data to an array to insert into results2 sheet
      
      return colorCoded(question);

    }).join('');
    return mapTop;
  }
  var htmlPusher1 = mapTop(empChecks);
  
  var htmlAreas = '<br>' + mapTop(textAreas) + '<br>';
  
  //Logger.log('htmlPusher1 = %s /n and htmlAreas  = %s',htmlPusher1,htmlAreas);
  // apends a row to insert the data to results2 sheet
  textAreasSheet.appendRow(pusher);  
  
  // The individual CT scores in a table with a header of the CT name
  var htmlPusher2 = ctInHouse.map(function(ct){
    var ctHeader = '<table border="0" cellspacing="2" cellpadding="1"><th colspan="2">' + ct.name + '</th>';
    return ctHeader + results1.map(function(entry){
      if ( ct.name == entry.name){
        
        return colorCoded(entry);
      };
    }).join('') + '</table><br>';
  }).join('');
  
  // Put the 2 strings together to make the body of the HTML email
  htmlPusher = '<table border="0" cellspacing="5" cellpadding="1">' + htmlPusher1 + htmlAreas + '</table><hr/>' + htmlPusher2;
  Logger.log(htmlPusher);
  
  // make subject of the email 
  var subject        = ampmEmoji + ' ' + results1[0].house + ' ' + ampmFlag + ' Submission by ' + user + ' ' + dateOnly;  
  
  // creates a template from the email.html file
  var htmlEmail      = HtmlService.createTemplateFromFile('NacheTML');
  
  // The Head of the whole email
  htmlEmail.data1    = results1[0].house + ' ' + ampmFlag + ' ✅ ' + dateOnly ;
  htmlEmail.subBy    = 'Submitted by ' + user; 
  
  // The Body of the email
  htmlEmail.dataUL   = htmlPusher;
  
  // This was kind of hard to figure out but you have to evaluate the template and then get a string of it. 
  // So the variables get rendered and then you turn it into a string to pass it to the Mail App as HTML.
  finalBody = htmlEmail.evaluate().getContent();
 // Logger.log(finalBody);
  // For each person on the email list - make an email.
  submitEmails.forEach(function(email){
    MailApp.sendEmail({
      to: email, 
      subject: subject, 
      htmlBody: finalBody,
      inlineImages: {
                      coastlineLogo: coastlineLogoBlob,
                      wrynstcrownLogo: wrynstcrownBlob
                    }
    });   
  });
  return true; // This is to pass back to the onSuccessHandler. I think I am going to show a toast or alert to notify that the submit was successful
}

/*
 *
 *
**/
function submitChecks(payload){
  goldStatus(payload);
  var ss         = SpreadsheetApp.openById(ssidOut);                 //
  var sheet      = ss.getSheetByName('results');
   
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

function colorCoded(objRow){
       
   var firstPart = '<tr><td valign="top">' + objRow.criteria + '</td><td valign="top">';
   var good = '<span class="good-score">' + objRow.value + '</span>';
   var bad  = '<span class="bad-score">'  + objRow.value + '</span>'; 
      if(objRow.value === false ){
        var secondPart = bad;
      }else if(objRow.value === true ){
        var secondPart = good;
      }else if(objRow.value >= 3){
        var secondPart = good;
      }else if(objRow.value < 3){
        var secondPart = bad;
      }else{
        var secondPart = objRow.value;
      };
   return firstPart + secondPart + '</td></tr>';
}

function goldStatus(payload){
  
  var dayOfWeekNum = today.getDay();
  var daysFromMon  = dayOfWeekNum - 1;
  var dayOfMonth   = today.getDate();
  var dayOfMonday  = dayOfMonth - daysFromMon;
  var currentMon   = new Date().setDate(dayOfMonday);
  var weekOf       = new Date(currentMon);
  
  var gold         = ssOut.getSheetByName('gold');
  var teal         = ssOut.getSheetByName('teal');
  // check to see if there are the current sheets, if not create them.
  if (!gold){
    ssOut.insertSheet('gold');
  }
  if(!teal){
    ssOut.insertSheet('teal');
  }
  Logger.log('Monday of this week would be :  %s?', weekOf);
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
//  var html = HtmlService.createTemplateFromFile('NacheTML');
//  html.data1 = 'data1 rulz';
//  html.subBy = 'no data' + 2;
//  html.dataUL = '<table><tr><th>row 1</th></tr><tr><th>row 2</th></tr></table>'
  Logger.log(mapTop(empChecks));
}
