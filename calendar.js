var google = require('googleapis');
var googleAuth = require('google-auth-library');
var http = require('http');
var querystring = require('querystring');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly','https://www.googleapis.com/auth/calendar'];
var clientId = process.env.GOOGLE_API_ID;
var clientSecret = process.env.GOOGLE_API_SECRET;
var redirectUrl = process.env.GOOGLE_RE;
var apikey = process.env.GOOGLE_API_KEY;
var timezone = process.env.TIME_ZONE | "0";
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl + '');

function getauthurl(session,next,callback)
{
	var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl + '/code');
	var authUrl = oauth2Client.generateAuthUrl({
    	access_type: 'offline',
    	scope: SCOPES,
      state: JSON.stringify(session.message.address)
  	});
  	var urlshortener = google.urlshortener('v1');
  	urlshortener.url.insert({ resource: {longUrl: authUrl }},{url:'https://www.googleapis.com/urlshortener/v1/url?key='+apikey}, function (err, response) {
  	if (err) {
    	console.log('Encountered error', err);
    	callback(session,next,null);
  	} else {
  		callback(session,next,response.id);
  	}
	});
}


function getToken(code,session,callback)
{

  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl + '/code');
	oauth2Client.getToken(code, function(err, token) {
      if (err) {
      	console.log(err);
      	callback(null,session);
      }
      else
      {
      	callback(token,session);
      }
    });

}
function addEvents(token,data,session,callback) {

  	var calendar = google.calendar('v3');
  	oauth2Client.credentials =token;
  
    // 轉換時區
    var utc_unlocal = Date.UTC(data.date.getFullYear(),data.date.getMonth(),data.date.getDate(),data.date.getHours(),data.date.getMinutes(),0,0);
  	var start  = new Date(utc_unlocal - parseInt(timezone) * 60 * 60 * 1000);
    console.log('ok');
  	var end = new Date(start.getTime() + 1 * 60 * 60 * 1000); 
  	var event = {
  		'summary': data.event,
  		'start': {'dateTime':start},
  		'end': {'dateTime':end},
  		'reminders': {'useDefault': true},
  		'description': 'Add by ScheduleHelp',
  	}
  	calendar.events.insert({
  		auth: oauth2Client,
  		calendarId: 'primary',
  		resource: event,
	}, function(err, event) {
  		if (err) {
    		console.log('There was an error contacting the Calendar service: ' + err);
    		callback(session,null);
  		}
  		else
  		{
  			var urlshortener = google.urlshortener('v1');
  			urlshortener.url.insert({ resource: {longUrl: event.htmlLink }},{url:'https://www.googleapis.com/urlshortener/v1/url?key='+apikey}, function (err, response) {
  				if (err) {
    				console.log('Encountered error', err);
    				callback(session,null);
  				} else {
  				callback(session,response.id);
  				}		
			});
  		}
	});


}

module.exports = {
    getauthurl: getauthurl,
    getToken: getToken,
    addEvents: addEvents
};