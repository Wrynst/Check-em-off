function testTracking(){
  Logger.log(weekOf());
}
// Finds the Date Obj of Monday for the current week. 
function weekOf(){
  var dayOfWeekNum   = today.getDay();
  var daysFromMon    = dayOfWeekNum - 1;
  var dayOfMonth     = today.getDate();
  var dayOfMonday    = dayOfMonth - daysFromMon;
  var currentMon     = new Date().setDate(dayOfMonday);
  var currMonDateObj = new Date(currentMon);
  return Utilities.formatDate(currMonDateObj, "PST", "MMM d yyyy")
}

function goldStatus(payload){
  var weekof = weekOf();

  
  var gold         = ssOut.getSheetByName('gold');
  var teal         = ssOut.getSheetByName('teal');
  // check to see if there are the current sheets, if not create them.
  if (!gold){
    ssOut.insertSheet('gold');
  }
  if(!teal){
    ssOut.insertSheet('teal');
  }
 // Logger.log('Monday of this week would be :  %s?', weekof);
}