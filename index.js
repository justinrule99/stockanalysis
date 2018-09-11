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
	//res.send("url format: /:symbol/:yyyy-mm-dd/:amount");
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
		var todayClose =  data['Time Series (Daily)']['2018-08-27']['4. close'];
		console.log("Closing on "+date+": "+oldClose+", Most recent closing: "+todayClose);

		var ret = getReturn(oldClose, todayClose, amount);
		console.log(ret);

		//loop through included dates to find a split event
		//need to figure out what to loop through
		//while(){

		//}


		var retformat = "Amount today if you invested $"+amount+" in "+symbol+" on "+date+": "+ret.rounded;
		var percent = "That's a "+ret.percentchange+"% "+ret.direction;
		var tot = "Total Return: "+ret.totalchange;




		console.log(retformat); 

		//console.log(data['Time Series (Daily)']['2014-03-27']);
		//console.log(data['Time Series (Daily)']['2014-03-28']);
		console.log(data['Time Series (Daily)']['2014-03-28']['8. split coefficient']);

		//var totalCoef = calcSplit()

		res.render('templatetest', {tile: symbol, retformat: retformat, percent: percent, tot: tot});

	}).catch((err) =>{
		console.log(err);
		console.log("Error! Potential causes: \n 	Invalid Stock Symbol \n 	Invalid Date (Non-Trading Day) \n 	Invalid Amount ");
		res.render('templatetest', {tile: "Error", retformat: "Error! That's Awkward", percent: "Potential Causes:", tot: "Invalid Symbol, Invalid Date, Invalid Amount"});

	}) 

	
	//res.render('templatetest', {tile: "idk", retformat: "Test", percent: "Test", tot: "Alpha Vantage is broken"});
	//const picker = datepicker(document.querySelector('#datepick'), {noWeekends: true});

});



app.listen(port);

console.log("app started on port " + port)

