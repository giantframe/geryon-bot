console.log("the bot is red!");

var Twit = require('twit');

var T = new Twit({
	consumer_key:         process.env.TWIT_CONSUMER_KEY,
	consumer_secret:      process.env.TWIT_CONSUMER_SECRET,
	access_token:         process.env.TWIT_ACCESS_TOKEN,
	access_token_secret:  process.env.TWIT_ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var params = {
	q: ' red ',
	lang: 'en',
	count: 50
}

var thaiBlock = /[\u0E00—\u0E7F]/g;
var bannedStuff = [
	/http/g,
	/\u0040/g,
	/@/g,
	/rt/g,
	];

var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\u0E00-\u0E7F\\'!"#$%&()*+,\-.\/:;<=>?\[\]^_`{|}~]/g;
var redCouplets = [];

getRedTweets();
setInterval(getRedTweets, 1000*60*60);

setInterval(postRedTweets, 1000*60*10);


function getRedTweets(){
	var redSingleLinesUnfiltered = [];
	var redSingleLinesFiltered = [];


	T.get('search/tweets', params, gotData);

	function findRed(textToCheck){
		if (textToCheck == "red"){
			return true;
		}
	}

	function censorship(textToCensor){
		for (i=0;i<bannedStuff.length-1;i++){
			if (textToCensor.search(bannedStuff[i]) >= 0){
				return false;
			}
		}
		return true;
	}

	function gotData(err, data, response){

		for (i=0;i<data.statuses.length;i++){

			var fullTweet;
			var partTweet;
			var redPos;
			var endPos;
			var redString;
			var startSlice;
			var endSlice;

			//SPLIT THE TWEET INTO AN ARRAY OF WORDS
			fullTweet = data.statuses[i].text.split(" ");

			//FIND THE WORD RED 
			redPos = fullTweet.findIndex(findRed);
			endPos = (fullTweet.length - 1);


			if (redPos >= 0){

				// WHERE TO START AND END

				if (redPos < 2){
					startSlice = 0;
				} else {
					startSlice = (redPos - 2);
				}

				if ((endPos - redPos) < 2){
					endSlice = endPos + 1;
				} else {
					endSlice = (redPos + 3);
				}

				//SLICE THE TWEET

				partTweet = fullTweet.slice(startSlice, endSlice);

				//MAKE THE STRING

				redString = partTweet.join(" ").replace(punctRE, "").toLowerCase();
				
				//ADD TO COUPLET-MAKING ARRAY

				redSingleLinesUnfiltered.push(redString);
				
				console.log("spliced: " + redString);
			}

		}
		coupletMaker();
	}

	function coupletMaker(){

		redSingleLinesFiltered = redSingleLinesUnfiltered.filter(censorship);

		for (i=0;i<(redSingleLinesFiltered.length);i+=2){
			var couplet = redSingleLinesFiltered.slice(i, (i+2));
			console.log("couplet:");
			console.log(couplet);
			var joinedCouplet = couplet.join(' ');

			redCouplets.push(joinedCouplet);
		}

		console.log("tweet array:")
		console.log(redCouplets);
	}
}

function postRedTweets(){


	if (redCouplets.length > 0){
		redTweetPoster();
	}

	function redTweetPoster(){
		var tweet = {
			status: redCouplets[0]
		}

		T.post('statuses/update', tweet, tweeted);

		redCouplets.shift();


		function tweeted(err, data, response){
			if (err){
				console.log('dang, things are looking pretty blue.');
				console.log(data);
			} else {
				console.log('yes! Geryon was a monster everything about him was red');
				console.log("this tweet:");
				console.log(tweet);
			}
		}

	}

}

// console.log(fullTweet);

// setInterval(tweetRed, 1000*60*60);

// function tweetRed(){

// 	var tweet = {
// 		status: 'red!'
// 	}

// 	T.post('statuses/update', tweet, tweeted)

// 	function tweeted(err, data, response)	{
// 		if (err){
// 			console.log('Something went wrong.');
// 			console.log(err);
// 		} else if {
// 			console.log('it is red!!');
// 		}
// 	}
// }