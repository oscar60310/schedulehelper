﻿var express = require('express');
var http = require('http');
var builder = require('botbuilder');
var std = require('./stringtodate');
var calendar = require('./calendar');
var fs = require('fs');
var util = require('util');
var datatmp = [];
var text = JSON.parse(fs.readFileSync("./data/textdata.json"));
//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
var port = process.env.port || 1337;
var app = express();
var code_user ; 
app.post('/api/messages', connector.listen());
app.get('/code', function(res,req){
	var addr = JSON.parse( decodeURIComponent(gup('state',res.url)));
    bot.beginDialog(addr,'/code',{code:gup('code',res.url)});
    req.end('ok, now you can close this window.');
});
app.use('/doc',express.static('doc'));
// 開啟伺服器
http.createServer(app).listen(port);
console.log('server started');


//=========================================================
// Bots Dialogs
//=========================================================

var model = 'https://api.projectoxford.ai/luis/v1/application?id=' + process.env.LUIS_ID + '&subscription-key=' + process.env.LUIS_KEY;
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });



bot.dialog('/',[function(session,next){
	if(session.userData.token == null)
	{

		
		calendar.getauthurl(session,next,function(session,next,url){
			if(url==null)
			{
				session.send("抱歉發生錯誤");
				next;
				//return;
			}
			var name = session.message.address.user.name;
			if (name == null)
				name ="";

			var msg = new builder.Message(session)
            	.attachments([
                	new builder.HeroCard(session)
                    	.text(util.format(text.dialog.request_google,name))
                    	.buttons(	[
                    		builder.CardAction.openUrl(session,url,"Google Calendar 授權")
                    	])
            	]);


        	session.send(msg); 
		});
	}
	else
		session.replaceDialog('/authed');

}]);


bot.dialog('/authed', dialog);
bot.dialog('/code', [function(session,args){
	calendar.getToken(args.code,session,function(token,session){
		if(token == null)
			session.replaceDialog('/')
		else
		{
			session.userData.token = token;
			session.send(text.dialog.introduction);
			session.endDialog();
		}
	});

}]);

dialog.matches('新增事件',[function (session, args, next) {
    var date = getentity(builder.EntityRecognizer.findEntity(args.entities, '日期'));
    var time = getentity(builder.EntityRecognizer.findEntity(args.entities, '時間'));
    var event = session.message.text.replace(date,'').replace(time,'');
    datatmp = {
    	date: getLocalTime(),
    	datestring: date,
    	timestring: time,
    	event: event,
    	complete:{
    		date: false,
    		time: false,
    		event: false
    	}
    };
    session.beginDialog('/askdate');
}]);

bot.dialog('/check',[function(session){

        var option = {
            retryPrompt: "您可以回答 'yes' 或 'no'"
        };

        var date_show = (datatmp.date.getMonth() + 1 ) + '/' + datatmp.date.getDate() +"("+ week[datatmp.date.getDay()] + ") ";
        date_show += addzero(datatmp.date.getHours()) + ":" + addzero(datatmp.date.getMinutes());
        builder.Prompts.confirm(session, "我將在 " + date_show + " 建立活動「" + datatmp.event + "」，這樣正確嗎?",option);
  
},function (session, results) {
        if (results.response) {
        	//session.sendTyping();
        	calendar.addEvents(session.userData.token,datatmp,session,function(session,data){
        		if(data == null)
        		{
        			// auth error
        			session.userData.token = null;
        			session.replaceDialog('/');
        		}
        		else
        		{
        			var msg = new builder.Message(session)
            		.attachments([
                		new builder.HeroCard(session)
                    	.text(text.dialog.create_complete)
                    	.buttons([
                    		builder.CardAction.openUrl(session,data,"事件連結")
                    	])
            		]);
        			session.send(msg);  
            		session.endDialog();
        		}
        	});
            
        } else {
            builder.Prompts.choice(session, text.dialog.sorry, ["日期","時間","名稱"],{
            retryPrompt: "我不太了解，請您選擇一個項目"});
        }
},function (session, results) {
        if (results.response) {
            if (results.response.entity == "日期")
            {
            	datatmp.datestring = null;
            	datatmp.complete.date = false;
            }
            else if (results.response.entity == "時間")
            {
            	datatmp.timestring = null;
            	datatmp.complete.time = false;
            }
            else
            {
            	datatmp.event = null;
				datatmp.complete.event = false;
            }
            session.replaceDialog('/askdate');
  
        }
}]);


bot.dialog('/askdate',[function(session){

	datatmp = std.addDate(datatmp);
	if(datatmp.complete.date == false)
	{
		builder.Prompts.text(session, "這個事項預計日期是? (您可以輸入11/1、明天、星期四等等)");
	}
	else
		session.replaceDialog('/asktime');
	
},function(session,results){
	datatmp.datestring = results.response;
	datatmp = std.addDate(datatmp);
	
	if(datatmp.complete.date == false)
	{
		session.send('我不太懂你的意思');
		session.replaceDialog('/askdate');
	}
	else
		session.replaceDialog('/asktime');
}

]);

bot.dialog('/asktime',[function(session){

	datatmp = std.addTime(datatmp);
	if(datatmp.complete.time == false)
	{
		builder.Prompts.text(session, "這個事項預計時間是? (您可以輸入1800、晚上六點、下午等等)");
	}
	else
		session.replaceDialog('/askevent');
	
},function(session,results){

	datatmp.timestring = results.response;
	datatmp = std.addTime(datatmp);
	
	if(datatmp.complete.time == false)
	{
		session.send('我不太懂你的意思');
		session.replaceDialog('/asktime');
	}
	else
		session.replaceDialog('/askevent');
}

]);


bot.dialog('/askevent',[function(session){

	datatmp = std.addEvent(datatmp);

	if(datatmp.complete.event == false)
	{
		builder.Prompts.text(session, "這個事項的名稱是? (您可以輸入 吃晚餐、約會等等)");
	}
	else
		session.replaceDialog('/check');
	
},function(session,results){

	datatmp.event = results.response;
	datatmp = std.addEvent(datatmp);
	
	if(datatmp.complete.event == false)
	{
		session.send('我不太懂你的意思');
		session.replaceDialog('/askevent');
	}
	else
		session.replaceDialog('/check');
}

]);




dialog.matches('詢問功能',  function (session, args, next) {
            session.beginDialog('/info');

});
dialog.onDefault(builder.DialogAction.send("抱歉，我不太了解您的意思，輸入「幫助」來查看教學。"));


var info = {
    "新增事件":
    {
        note: text.tutorial.add_event,
        title:'新增事件'
    },
    "關於我":
    {
    	note: text.tutorial.who_are_you,
    	title: '我是誰'
    }
};
bot.dialog('/info',[
function(session,args){
    builder.Prompts.choice(session, "您需要什麼要的資訊呢?", info);

},
function (session, results){
    if (results.response) {
        var region = info[results.response.entity];
        session.send("有關%(title)s", region); 
        session.send(region.note); 
        session.endDialog();
    } 
    else {
        session.send("ok");
        session.endDialog();
    }
}
]);

function getentity(c)
{
    return (c!=null) ? c.entity.replace(' ','') : null;
}

function timefactory(d)
{
    var now = new Date();

    d.setFullYear(now.getFullYear());
    if(d.getTime() < now.getTime())
         d.setFullYear(now.getFullYear()+1);
  // d.setTime(d.getTime() - (8*60*60*1000));
    return d;
}
function getLocalTime()
{
	var t = process.env.timefix || 8;
	var now = new Date();
	var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	utc.setTime(utc.getTime() + t*60*60*1000);
	return utc;
}
var week = ['日','一','二','三','四','五','六'];
function addzero(d)
{
	return (d<10)? ("0" + d.toString()) : d.toString();
}


function gup( name, url ) {
	url = url.split('?')[1];
	var args = url.split('&');
	for(var i = 0;i<args.length;i++)
	{
		if(args[i].split('=')[0] == name)
			return args[i].split('=')[1];
	}
    return null;
}
