
function addDate(data)
{
    if(data.complete.date)
        return data;
   // console.log(data);
    var ds = data.datestring;
   
    if(ds == null)
        return data;
    try {
        var dsc = ds.replace('星期','禮拜').replace('周','禮拜').replace('週','禮拜');
        if(ds.indexOf('/') >= 0)
        {
            var date = new Date(data.date);
            date.setMonth(parseInt(ds.split('/')[0]) - 1);
            date.setDate(parseInt(ds.split('/')[1]));
            data.date = date;
            data.event =  data.event.replace(data.datestring,'');
          //  data.event =  data.event.replace(data.datestring.replace(' ',''),'');
            data.complete.date = true;
        }
        else if(!isNaN(datebase[dsc])) // 今天明天後天...
        {
            var date = new Date(data.date);
            date.setTime(date.getTime() + datebase[dsc] * 24 * 60 *60 * 1000);
            data.date = date;
            data.event =  data.event.replace(data.datestring,'');
            data.complete.date = true;
        }
        else if(!isNaN(weekbase[dsc]))
        {
            var date = new Date(data.date);
            var now = getLocalTime();
            var bwtween = weekbase[dsc] - now.getDay();
            bwtween = (bwtween<0)? bwtween + 7 : bwtween; 
            date.setTime(now.getTime() + bwtween * 24 * 60 *60 * 1000);
            data.date = date;
            data.event =  data.event.replace(data.datestring,'');
            data.complete.date = true;
        }
        return data
    }
    catch(err)
    {
        console.log('[err] '+ err);
        return data;
    }
}
function addTime(data)
{
    if(data.complete.time)
        return data;
    var ds = data.timestring;
   
    if(ds == null)
        return data;
    try {
        var dsint = parseInt(ds);
     
        // 18:00
        if(ds.indexOf(':') >= 0)
        {
            var date = new Date(data.date);
            date.setHours(parseInt(ds.split(':')[0]));
            date.setMinutes(parseInt(ds.split(':')[1]));
            data.date = date;
            data.event =  data.event.replace(data.timestring,'');
          //  data.event =  data.event.replace(data.timestring.replace(' ',''),'');
            data.complete.time = true;
        }     
        else if(!isNaN(dsint))
        {
            var date = new Date(data.date);
            date.setHours((dsint/100).toString());
            date.setMinutes((dsint%100).toString());
            data.date = date;
            data.event =  data.event.replace(data.timestring,'');
            data.complete.time = true;
        }
        else
        {
            
            if(!isNaN(timebase[ds]))
            {
               // console.log(timebase[ds]);
                var date = new Date(data.date);
                date.setHours((timebase[ds]/100).toString());
                date.setMinutes((timebase[ds]%100).toString());
                data.date = date;
                data.event =  data.event.replace(data.timestring,'');
                data.complete.time = true;
            }
        }
        return data
    }
    catch(err)
    {
        console.log('[err] '+ err);
        return data;
    }
}
function addEvent(data)
{
    if(data.complete.event)
        return data;
    var ds = data.event;
   
    if(ds == null)
        return data;
    try {

        if((ds.replace(' ','')).length > 0)
            data.complete.event = true;
        return data
    }
    catch(err)
    {
        console.log('[err] '+ err);
        return data;
    }
}
function getLocalTime()
{
    var t = process.env.timefix || 8;
    var now = new Date();
    var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    utc.setTime(utc.getTime() + t*60*60*1000);
    return utc;
}
module.exports = {
    addDate: addDate,
    addTime: addTime,
    addEvent: addEvent
};
var timebase = {
    '早上': 800,
    '中午': 1200,
    '下午': 1500,
    '晚上': 2000,
    '早上一點': 100,
    '早上二點': 200,
    '早上三點': 300,
    '早上四點': 400,
    '早上五點': 500,
    '早上六點': 600,
    '早上七點': 700,
    '早上八點': 800,
    '早上九點': 900,
    '早上十點': 1000,
    '早上十一點': 1100,
    '中午十二點': 1200,
    '下午一點': 1300,
    '下午兩點': 1400,
    '下午三點': 1500,
    '下午四點': 1600,
    '下午五點': 1700,
    '晚上六點': 1800,
    '晚上七點': 1900,
    '晚上八點': 2000,
    '晚上九點': 2100,
    '晚上十點': 2200,
    '晚上十一點': 2300

};
var datebase = {
    '今天': 0,
    '明天': 1,
    '後天': 2
};
var weekbase = {
    '禮拜一': 1,
    '禮拜二': 2,
    '禮拜三': 3,
    '禮拜四': 4,
    '禮拜五': 5,
    '禮拜六': 6,
    '禮拜日': 0,
    '禮拜天': 0,
    '下禮拜一': 8,
    '下禮拜二': 9,
    '下禮拜三': 10,
    '下禮拜四': 11,
    '下禮拜五': 12,
    '下禮拜六': 13,
    '下禮拜日': 7,
    '下禮拜天': 7,
}