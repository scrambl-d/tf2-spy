// ==UserScript==
// @name		TF2 User Info
// @match *://*.steamcommunity.com/id/*
// @match *://*.steamcommunity.com/profiles/*
// @match *://*.logs.tf/*
// @match *://*.tf2center.com/*
// @namespace	https://github.com/scrambl-d/userinfo
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var domain = "";
var htmlNameClass = "";
var id64;

switch(document.location.hostname) {
	case "steamcommunity.com":
		domain = "steamcommunity";
		id64 = getID64SteamCommunity();
		console.log(id64);
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

function getID64SteamCommunity() {
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

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// todo steam key
// api key 7C65DC48D67139E16E83C0CE307E9CD0
// https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=7C65DC48D67139E16E83C0CE307E9CD0&vanityurl=scrambled_ry_link";