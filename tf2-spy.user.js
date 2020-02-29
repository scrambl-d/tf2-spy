// ==UserScript==
// @name			TF2 Spy
// @match			*://*.steamcommunity.com/id/*
// @match			*://*.steamcommunity.com/profiles/*
// @match			*://*.logs.tf/*
// @match			*://*.tf2center.com/*
// @namespace		https://github.com/scrambl-d/tf2-spy
// @version			0.0
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_xmlhttpRequest
// @grant			GM.xmlHttpRequest
// @grant			GM.getValue
// @grant			GM.setValue
// @connect			etf2l.org
// @updateURL		https://github.com/scrambl-d/tf2-spy/raw/release/tf2-spy.user.js
// @require			https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

// greasemonkey compatibility
if (typeof GM_xmlhttpRequest === 'undefined' && typeof GM !== 'undefined') {
	self.GM_getValue = GM.getValue;
	self.GM_setValue = GM.setValue;
	self.GM_xmlhttpRequest = GM.xmlHttpRequest;
}

// stop showing syntax errors for jquery
var $ = window.jQuery;

class Players {
	constructor() {
		this.data = {};
		this.selectedPlayer = null;
		this.etf2lLookup = true;
	}
	
	update(id64, context) {
		// lookup checks
		var lookups = 0;
		var completeLookups = 0;
		if (etf2lLookup) {
			++lookups
			if (this.data[id64].etf2l.id) ++completeLookups;
		}
		
		// if all lookups are complete
		if (lookups == completeLookups) {
			this.display(id64,context);
		}
	}
	
	display(id64,context) {
		if (context == "steam") {
			var displayLocation = ".profile_header_centered_persona";
			var playerInfo = this.data[id64];
			if (etf2lLookup && playerInfo.etf2l.id) {
				var etf2lLink = "<span id=\"\tf2-spy\">ETF2L: <a href=\"http://etf2l.org/forum/user/" + playerInfo.etf2l.id + "\">" + playerInfo.etf2l.name + "</a>";
				if (!$("#tf2-spy").length) $(displayLocation).append(etf2lLink);
			}
		}
	}
	
	selectPlayer(id64, context) {
		if (this.data[id64] === undefined) {
			this.data[id64] = new Player();
		}
		this.selectedPlayer = id64;
		if (context == "steam") {
			if (this.etf2lLookup) {
				etf2lLookup(id64, context)
			}
		}
	}
	
	getSelectedPlayer() {
		return this.data[this.selectedPlayer];
	}
}

class Player {
	constructor() {
		this.timestamp = Date.now();
		
		this.etf2l = {
			id			: "",
			name		: "",
			country		: "",
			
			peak6v6 	: {},
			current6v6	: {},
			
			peakHL		: {},
			currentHL	: {}
		}
	}
}

class divInfo {
	constructor(div, team, season) {
		this.div = div;
		this.team = team;
		this.season = season;
	}
}

var players = new Players() 

switch(document.location.hostname) {
	case "steamcommunity.com":
		resolveSteamVanity("steam");
		break;
	case "logs.tf":
		break;
	case "tf2center.com":
		//htmlNameClass = "name";
		break;
	default:
		console.log("domain not in switch");
}

			// + "<img src=\"http://etf2l.org/images/flags/"
			// + playerInfo.etf2l.country
			// + ".gif\"></a></span>";
			
function resolveSteamVanity(context) {
	var id = 0;
	var regex = /(?:^.{4,5}\:\/\/steamcommunity.com\/)([a-z]*)(?:.*)/i;
	var pageType = document.URL.match(regex)[1];
	regex = new RegExp("(?:^.{4,5}\:\/\/steamcommunity.com\/" + pageType + "\/)([^\/]+)", "i");
	
	if (pageType == "id") {
		var apiKey = "7C65DC48D67139E16E83C0CE307E9CD0";
		var vanity = document.URL.match(regex)[1];
		
		GM_xmlhttpRequest({
			method: "GET",
			url: "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=" + apiKey + "&vanityurl=" + vanity + "&format=json",
			onload:function(response) {
				var data = JSON.parse(response.responseText);
				players.selectPlayer(data.response.steamid, context);
			}
		});
	}
	if (pageType == "profiles") {
		players.selectPlayer(document.URL.match(regex)[1], context);
	}
}

function etf2lLookup(id64, context) {
	GM_xmlhttpRequest({
		method: "GET",
		url: "http://api.etf2l.org/player/" + id64 + ".json",
		onload: function (response){
			var data = JSON.parse(response.responseText);
			if (data.player.id) {
				players.data[id64].etf2l.id = data.player.id;
				players.data[id64].etf2l.name = data.player.name;
				players.data[id64].etf2l.country = data.player.country;
			}
			else players[id64.etf2l.id] = 0;
			players.update(id64, context);
		}
	});
}