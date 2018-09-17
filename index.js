var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000,
	bodyParser = require('body-parser')
app.set('view engine', 'pug');
app.use(express.static('views'));

var alphaApiKey = 'WL0R2WRTBNVUFAWL';
//first key: 7Z2OEJF4TIZYHWDN
//second key: WL0R2WRTBNVUFAWL

const alpha = require('alphavantage')({ key: alphaApiKey });


//bug: large gains interperted as large negative losses
//interpreted as currentval>oldval when currentval really >> oldval
//must deal with stock splits
//gonna change some stuff
var getReturn = function(oldVal, currentVal, investment){
	var factor = currentVal / oldVal;
	var rounded = Math.round((investment*factor) * 100) / 100;
	var percentchange;
	var direction;
	console.log(currentVal);
	console.log(oldVal);
	var intcval = parseInt(currentVal);
	var intoval = parseInt(oldVal);
	console.log("int of currval:"+intcval);
	if(currentVal > oldVal){
		percentchange = Math.round((factor-1) * 100000) / 1000;
		direction = "gain";
		console.log('greater');
	}

	else if(currentVal < oldVal){
		percentchange = Math.round((1-factor) * 100000) / 1000;
		direction = "loss";
		console.log("less");
	}
	else{
		console.log("wat");
		direction = "error";
		percentchange = 0;
	}

	var totalchange =  Math.round((rounded - investment) * 100) / 100;

	var obj = {
	    rounded:  rounded,
	    percentchange: percentchange,
	    totalchange: totalchange,
	    direction: direction
	};

	return obj;
}

var urlencodedParser = bodyParser.urlencoded({ extended: false })


//split coefficient
var calcSplit = function(startDate, todayDate, splits){
	for (var i = 0; i <= splits.length; i++) {
		
	}
}

var postToNew = function(res, symbol, date, amount){

	var url = '/'+symbol+'/'+date+'/'+amount;
	res.redirect(url);
}

//redirects request with given stock values
app.post('/:symbol/:date/:amount', urlencodedParser, function(req,res){
	var symbol = req.body.symbol;
	var date = req.body.date;
	var amount = req.body.amount;
	postToNew(res, symbol, date, amount);
})

app.get('/', function(req,res){
	console.log("get request on index");
	res.render('templatetest', {title: "Stocks", retformat: "Welcome to the stock market analysis tool!", percent: "Enter data on the right to see stock results over time"});
})

//redirects request with given stock values
app.post('/', urlencodedParser, function(req,res){
	var symbol = req.body.symbol;
	var date = req.body.date;
	var amount = req.body.amount;

	postToNew(res, symbol, date, amount);

})


//todo: get split coefficient and calculate overall coef

app.get('/:symbol/:date/:amount', function(req,res){
	var symbol = req.params.symbol;
	var date = req.params.date;
	var amount = req.params.amount;

	alpha.data.daily_adjusted(symbol, 'full', 'json', '1min').then(data => { 

		var oldClose = data['Time Series (Daily)'][date]['4. close'];
		var todayClose =  data['Time Series (Daily)']['2018-09-12']['4. close'];
		console.log("Closing on "+date+": "+oldClose+", Most recent closing: "+todayClose);

		var ret = getReturn(oldClose, todayClose, amount);
		console.log(ret);

		//loop through included dates to find a split event
		//need to figure out what to loop through to capture splits within time frame
		//while(){

		//}


		var retformat = "Amount today if you invested $"+amount+" in "+symbol+" on "+date+": "+ret.rounded;
		var percent = "That's a "+ret.percentchange+"% "+ret.direction;
		var tot = "Total Return: "+ret.totalchange;
		var unixTime = Date.now(); 
		console.log("TIME: "+unixTime);
		//doesn't give updated news for some stocks
		var widgeturl = 'http://us1.rssfeedwidget.com/getrss.php?time='+unixTime+'&x=http%3A%2F%2Farticlefeeds.nasdaq.com%2Fnasdaq%2Fsymbols%3Fsymbol%3D' + symbol+'&w=200&h=500&bc=333333&bw=1&bgc=transparent&m=20&it=true&t=(default)&tc=333333&ts=15&tb=transparent&il=true&lc=0000FF&ls=14&lb=false&id=true&dc=333333&ds=14&idt=true&dtc=284F2D&dts=12';




		console.log(retformat); 

		//console.log(data['Time Series (Daily)']['2014-03-27']);
		//console.log(data['Time Series (Daily)']['2014-03-28']);
		console.log(data['Time Series (Daily)']['2014-03-28']['8. split coefficient']);

		//var totalCoef = calcSplit()

		res.render('templatetest', {tile: symbol, retformat: retformat, percent: percent, tot: tot, widgeturl: widgeturl});

	}).catch((err) =>{
		console.log(err);
		console.log("Error! Potential causes: \n 	Invalid Stock Symbol \n 	Invalid Date (Non-Trading Day) \n 	Invalid Amount ");
		res.render('templatetest', {tile: "Error", retformat: "Error! That's Awkward", percent: "Potential Causes:", tot: "Invalid Symbol, Invalid Date, Invalid Amount"});

	}) 

	
	//res.render('templatetest', {tile: "idk", retformat: "Test", percent: "Test", tot: "Alpha Vantage is broken"});

});



app.listen(port);

console.log("app started on port " + port)

