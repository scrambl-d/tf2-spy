// ==UserScript==
// @name		TF2 User Info
// @match		*://*.steamcommunity.com/id/*
// @match		*://*.steamcommunity.com/profiles/*
// @match		*://*.logs.tf/*
// @match		*://*.tf2center.com/*
// @namespace	https://github.com/scrambl-d/userinfo
// @require		https://code.jquery.com/jquery-3.4.1.min.js
// @require 	https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant		GM_getValue
// @grant		GM.getValue
// @grant		GM_setValue
// @grant		GM.setValue
// ==/UserScript==

var domain = "";

class Players {
	constructor() {
		(async () => {
			this.players = JSON.parse(await GM.getValue("cache", "{}")); 
		})();
		this.selectedPlayer = null;
	}
	
	selectPlayer(id64) {
		if (!this.players[id64]) {
			this.players[id64] = new Player();
		}
		this.selectedPlayer = id64;
	}
	
	populateETF2L() {
		if (!this.players[this.selectedPlayer].etf2l.id) {
			this.data = getETF2LData(this.selectedPlayer);
			
			this.players[this.selectedPlayer].etf2l.id = this.data.player.id;
			this.players[this.selectedPlayer].etf2l.name = this.data.player.name;
			this.players[this.selectedPlayer].etf2l.country = this.data.player.country;
		}
	}
	
	logData() {
		console.log(this.players[this.selectedPlayer]);
	}
}

class Player {
	constructor() {
		this.birth = Date.now();
		
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

players = new Players() 

switch(document.location.hostname) {
	case "steamcommunity.com":
		domain = "steamcommunity";
		var id64 = getSteamcommunityID64();
		players.selectPlayer(id64);
		players.populateETF2L();
		players.logData();
		break;
	case "logs.tf":
		domain = "logs.tf";
		//htmlNameClass = "dropdown-toggle";
		break;
	case "tf2center.com":
		domain = "tf2center";
		//htmlNameClass = "name";
		break;
	default:
		console.log("domain not in switch");
}

function getSteamcommunityID64() {
	var id = 0;
	// get steamcommunity.com/profiles/* or /id/* -- vanity uses id, non vanity uses profiles
	var regex = /(?:^.{4,5}\:\/\/steamcommunity.com\/)([a-z]*)(?:.*)/i;
	var pageType = document.URL.match(regex)[1];
	
	// get the part of the url with the vanity or id64
	var regex = /(?:^.{4,5}\:\/\/steamcommunity.com\/[a-z]*\/)(.*)(?:\/$)/i;
	var vanity = document.URL.match(regex)[1];
	// vanity url
	if (pageType == "id") {
		var apiKey = "7C65DC48D67139E16E83C0CE307E9CD0";
		var json = JSON.parse(httpGet("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=" + apiKey + "&vanityurl=" + vanity));
		id = json.response.steamid;
	}
	// id64 url
	if (pageType == "profiles") {
		id = vanity; // removes 0 from amy's profile
	}
	
	return id;
}

function getETF2LData(id64) {
	var data = JSON.parse(httpGet("http://api.etf2l.org/player/" + id64 + ".json"));
	return data;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// todo steam key
// api key 7C65DC48D67139E16E83C0CE307E9CD0
// https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=7C65DC48D67139E16E83C0CE307E9CD0&vanityurl=scrambled_ry_link";