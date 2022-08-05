// Styles
import "./style/style.css";
import "./style/app.css";

// Scripts
import "gun/gun.js";
import "gun/sea.js";
import "./lib/as.js";
import "./lib/joy.js";
import "./lib/meta.js";
import home from './page/home.js'
import settings from './page/settings.js'
import activity from './page/activity.js'
import {create, auth} from './page/auth.js'
var joy = JOY;

// Theme
var storedTheme =
	localStorage.getItem("theme") ||
	(window.matchMedia("(prefers-color-scheme: dark)").matches
		? "night"
		: "day");
var storedKey = localStorage.getItem("key")

if (storedTheme) document.documentElement.setAttribute("theme", storedTheme);

if (storedKey) joy.auth(JSON.parse(storedKey));

gun.on("auth", function (ack) {
  if (!storedKey) {
    localStorage.setItem("key", JSON.stringify(joy.key));
  }8
	console.log("Your namespace is publicly available at", ack.soul);
	});
meta.edit({
	name: "home",
	combo: ["H"],
	on: (eve) => {
		joy.route("home");
	},
});
meta.edit({
	name: "create",
	combo: ["H", "A"],
	on: (eve) => {
	  joy.auth(null, ()=> {
	    joy.tell("a ⭐ is born")
	  }, true);
		//joy.route("home");
	},
});
meta.edit({
	name: "tell",
	combo: ["H", "T"],
	on: (eve) => {
		meta.ask("tell me something", (what) => {
			if (!what) return;
			joy.tell(what);
		});
	},
});

meta.edit({
	name: "settings",
	combo: ["S"],
	// fake: -1,
	on: (eve) => {
		joy.route("settings");
	},
});
meta.edit({
	name: "theme",
	combo: ["S", "C"],
	on: function () {
		var before = document.documentElement.getAttribute("theme");
		var now = before === "day" ? "night" : "day";
		document.documentElement.setAttribute("theme", now);
		localStorage.setItem("theme", now);
		joy.tell(`${now} mode activated`);
		return;
	},
});

meta.edit({
	name: "activity",
	combo: ["A"],
	on: (eve) => {
		joy.route("activity");
	},
});
joy.route.page("home", function () {
	document.title = "ariob";
	
	var ask = $('#askme')
	ask.on('click', function(){
	  meta.ask("passcode", function (ans){
	    joy.tell(ans)
	  },{"type": "password", "pattern": "[0-9]*", "inputmode": "numeric"})
	});
});

joy.route.page("create", function () {
	//document.title = "ariob - activity";
	//c.tell('In Activity')
});

joy.route.page("activity", function () {
	document.title = "ariob - activity";
	//c.tell('In Activity')
});
joy.route.page("settings", function () {
	document.title = "ariob - settings";
	//c.tell('In Settings')
});

document.querySelector("#app").innerHTML = `
  ${activity}
  ${home}
  ${settings}
  ${create}
  ${auth}
`;
