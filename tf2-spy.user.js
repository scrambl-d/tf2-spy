	// ==UserScript==
	// @name			TF2 Spy
	// @match			*://*.steamcommunity.com/id/*
	// @match			*://*.steamcommunity.com/profiles/*
	// @match			*://*.logs.tf/*
	// @match			*://*.tf2center.com/*
	// @namespace		https://github.com/scrambl-d/tf2-spy
	// @version			0.2
	// @grant			GM_getValuea
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

	function toggleSpyBox() {
		$("#tf2-spy-box").toggle();
	}

	class Players {

		constructor() {
			this.data = {};
			this.selectedPlayer = null;
			this.displayETF2L = true;
			this.displayLogs = true;
		}

		display(id64,context) {
			
			var boxCss = "\
			display: none;					\
			background-color: #000022;	    \
			color:#FFFFFF;					\
			position: relative;				\
			top: -20px;						\
			left: 30px;						\
			padding: 10px 10px 10px 10px;	\
			max-width: 250px;				\
			";
			
			var box = "<span id=\"tf2-spy\">";
				box += "<a ";
				box += "href=\"#\"" ;
				box += "id=\"tf2-spy-link\"" ;
				box += ">";
				box += "TF2-Spy";
				box += "</a>";
				box += "<div id=\"tf2-spy-box\" style=\"" + boxCss + "\">";
				box += "TF2-SPY";
				box += "</div></span>";
			

			
			var playerInfo = this.data[id64];
			var boxContent = "";
			
			if (context == "steam") {
				var displayLocation = ".profile_header_centered_persona";
			}
			
			if (!$("#tf2-spy").length) $(displayLocation).append(box); 
			
			document.getElementById("tf2-spy-link").addEventListener("click", toggleSpyBox,false);
			
			if (playerInfo.etf2l.id) {
				boxContent += "<a href=\"http://etf2l.org/forum/user/" + playerInfo.etf2l.id + "\">" + playerInfo.etf2l.name + "</a><br />";
			}
			
			if (this.displayLogs) {
				boxContent += "<a href=\"https://logs.tf/profile/" + id64 + "\">logs.tf</a><br />"
			}
			
			$("#tf2-spy-box").html(boxContent);
			
		}
		
		selectPlayer(id64, context) {
			if (this.data[id64] === undefined) {
				this.data[id64] = new Player();
			}
		this.display(id64, context);
			if (this.displayETF2L) {
				etf2lLookup(id64, context);
			}
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
			steamCommunity();
			break;
		case "logs.tf":
			break;
		case "tf2center.com":
			break;
		default:
			console.log("domain not in switch");
	}

				// + "<img src=\"http://etf2l.org/images/flags/"
				// + playerInfo.etf2l.country
				// + ".gif\"></a></span>";
				
	function steamCommunity() {
		var context = "steam";
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
				else players.data[id64].etf2l.id = 0;
				players.display(id64, context);
			}
		});
	}