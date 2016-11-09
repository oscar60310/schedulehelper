var std = require('../stringtodate');
var should = require('should');
describe('#string to date test', function(){
	var datatmp = {
    	date: getLocalTime(),
    	datestring: '星期日',
    	timestring: '早上八點',
    	event: '早上八點測試',
    	complete:{
    		date: false,
    		time: false,
    		event: false
    	}
    };
    it('date should be complete', function(done){
        datatmp = std.addDate(datatmp);
        datatmp.complete.date.should.equal(true); 
        done();
    })
    it('time should be complete', function(done){
        datatmp = std.addTime(datatmp);
        datatmp.complete.time.should.equal(true); 
        done();
    })
    it('event should remove timestring', function(done){
        datatmp.event.should.equal('測試'); 
        done();
    })

   
})
function getLocalTime()
{
	var t = process.env.timefix || 8;
	var now = new Date();
	var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	utc.setTime(utc.getTime() + t*60*60*1000);
	return utc;
}