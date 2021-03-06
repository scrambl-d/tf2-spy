// ==UserScript==
// @name			TF2 Spy
// @match			*://*.steamcommunity.com/id/*
// @match			*://*.steamcommunity.com/profiles/*
// @match			*://*.logs.tf/*
// @match			*://*.tf2center.com/*
// @connect			etf2l.org
// @namespace		https://github.com/scrambl-d/tf2-spy
// @version			0.3.1
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_xmlhttpRequest
// @grant			GM.xmlHttpRequest
// @grant			GM.getValue
// @grant			GM.setValue

// @updateURL		https://github.com/scrambl-d/tf2-spy/raw/release/tf2-spy.user.js
// @require			https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

// greasemonkey compatibility
if (typeof GM_xmlhttpRequest === "undefined" && typeof GM !== "undefined") {
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

  selectPlayer(id64, number = 0) {
    if (this.data[id64] === undefined) {
      this.data[id64] = new Player();
    }
    addLogsLink(id64, number);
    lookupETF2L(id64, number);
  }
}

class Player {
  constructor() {
    this.timestamp = Date.now();

    this.etf2l = {
      id: "",
      name: "",
      country: "",

      peak6v6: {},
      current6v6: {},

      peakHL: {},
      currentHL: {},
    };
  }
}

class divInfo {
  constructor(div, team, season) {
    this.div = div;
    this.team = team;
    this.season = season;
  }
}

var players = new Players();

switch (document.location.hostname) {
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
  makeBox(".profile_header_centered_persona > .persona_name");
  var id = 0;
  var regex = /(?:^.{4,5}\:\/\/steamcommunity.com\/)([a-z]*)(?:.*)/i;
  var pageType = document.URL.match(regex)[1];
  regex = new RegExp(
    "(?:^.{4,5}://steamcommunity.com/" + pageType + "/)([^/?]+)",
    "i"
  );

  if (pageType == "id") {
    var apiKey = "7C65DC48D67139E16E83C0CE307E9CD0";
    var vanity = document.URL.match(regex)[1];

    GM_xmlhttpRequest({
      method: "GET",
      url:
        "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=" +
        apiKey +
        "&vanityurl=" +
        vanity +
        "&format=json",
      onload: function (response) {
        var data = JSON.parse(response.responseText);
        players.selectPlayer(data.response.steamid);
      },
    });
  }
  if (pageType == "profiles") {
    players.selectPlayer(document.URL.match(regex)[1]);
  }
}

function makeBox(location, number = 0) {
  var iconStyle = "max-height:12px;width:auto;verticle-align:bottom;";

  var boxContent = "<table>";

  boxContent += "<tr>";
  boxContent += "<td>";
  boxContent +=
    '<img src="https://raw.githubusercontent.com/scrambl-d/tf2-spy/release/img/etf2l.ico" style="' +
    iconStyle +
    '" /> ';
  boxContent += '<span class="etf2lrow">';
  boxContent += "Loading...";
  boxContent += "</span>";
  boxContent += "</td>";
  boxContent += "</tr>";
  boxContent += "<tr>";
  boxContent += "<td>";
  boxContent +=
    '<img src="https://github.com/scrambl-d/tf2-spy/raw/release/img/logstf.png" style="' +
    iconStyle +
    '" /> ';
  boxContent += '<span class="logsrow">';
  boxContent += "Loading...";
  boxContent += "</span>";
  boxContent += "</tr>";
  boxContent += "</td>";
  boxContent += "</table>";

  var linkCss = "";
  linkCss += "font-size: 12px";

  var boxCss = "";
  boxCss += "display: table;";
  boxCss += "position: absolute;";
  boxCss += "top: 0;";
  boxCss += "left: 30px;";
  boxCss += "color:#FFFFFF;";
  boxCss += "background-color: #121414;";
  boxCss += "border: none;";
  boxCss += "line-height: 10pt;";
  boxCss += "font-size: 12px;";
  boxCss += "z-index: 3;";

  var box = "";
  box += '<span class="tf2-spy box' + number + '"';
  box += 'style="position: relative"';
  box += ">";
  box += "<a ";
  box += 'href="#"';
  box += 'class="tf2-spy-link"';
  box += 'style="' + linkCss + '"';
  box += ">";
  box +=
    '<img src="https://github.com/scrambl-d/tf2-spy/raw/release/img/spycrab.png" style="max-height:24px;width:auto;verticle-align:bottom;" />';
  box += "</a>";
  box += '<div class="tf2-spy-box" style="' + boxCss + '">';
  box += boxContent;
  box += "</div></span>";

  $(location).append(box);

  $(".box" + number + " .tf2-spy-link").on("click", function () {
    $(".box" + number + " .tf2-spy-box").toggle();
  });

  $(".box" + number + " .tf2-spy-box").hide();
}

function addLogsLink(id, number) {
  $(".box" + number + " .logsrow").html(
    '<a href="https://logs.tf/profile/' + id + '">logs.tf</a>'
  );
  getLogsNumber(id, number);
}

function getLogsNumber(id, number) {
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://logs.tf/api/v1/log?player=" + id,
    onload: function (response) {
      var data = JSON.parse(response.responseText);
      $(".box" + number + " .logsrow").append(
        ' <span style="opacity: 0.5">' + data.total + " logs</span>"
      );
    },
  });
}

function lookupETF2L(id64, number) {
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://api.etf2l.org/player/" + id64 + ".json",
    onload: function (response) {
	  try {
		var data = JSON.parse(response.responseText);
		players.data[id64].etf2l.id = data.player.id;
        players.data[id64].etf2l.name = data.player.name;
        $(".box" + number + " .etf2lrow").html(
          '<a href="https://etf2l.org/forum/user/' +
            players.data[id64].etf2l.id +
            '">' +
            players.data[id64].etf2l.name +
            "</a>"
        );
	  }
	  catch (e) {
		$(".box" + number + " .etf2lrow").html("No profile");
	  }
    },
    onerror: function (response) {
      $(".box" + number + " .etf2lrow").html("No profile");
    },
  });
}

function addETF2LLink(name, id, number) {
  $(".box" + number + " .etf2lrow").html(
    '<a href="https://etf2l.org/user/' + id + '">' + name + "</a>"
  );
}
