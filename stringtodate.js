
function addDate(data)
{
    if(data.complete.date)
        return data;
   // console.log(data);
    var ds = data.datestring;
   
    if(ds == null)
        return data;
    try {

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
        else if(!isNaN(datebase[ds]))
        {
            var date = new Date(data.date);
            date.setTime(date.getTime() + datebase[ds] * 24 * 60 *60 * 1000);
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
