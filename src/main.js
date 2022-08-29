import "./style/style.css";
import "./style/app.css";

import "gun/gun.js";
import "gun/sea.js";
// import "gun/lib/monotype.js";
// import "gun/lib/normalize.js";
import "./lib/as.js";
import "./lib/chain.js";
import "./lib/joy.js";
import "./lib/meta.js";
import "./style";

import nav from "./component/nav.js";
import header from "./component/header.js";
import { page } from "./page";
import { model } from "./model";

var user = JOY.user;
var storedTheme =
	localStorage.getItem("theme") ||
	(window.matchMedia("(prefers-color-scheme: dark)").matches
		? "night"
		: "day");
var storedKey = localStorage.getItem("key");

if (storedTheme) document.documentElement.setAttribute("theme", storedTheme);
if (storedKey) JOY.auth(JSON.parse(storedKey));

gun.on("auth", async function (ack) {
	if (!storedKey) {
		localStorage.setItem("key", JSON.stringify(JOY.key));
	}
	if (ack.soul) {
		var $me = $("#account a.primary");
		var pub = "~" + user.is.pub;
		$me.html("");
		$me.removeClass("primary");
		$me.addClass("rim sap");
		$me.removeClass("act");
		$me.attr("href", `#profile/?pub=${pub}`);
		user.get("profile").on((d) => {
			JOY.route.render("my", ".persona-mini", $me, {
				avatar: {
					src: JOY.avatar(d.avatar),
				},
			});
		});
	}
	await JOY.user.generateCert(
		"*",
		[{ "*": "notifications" }, { "*": "notify" }],
		"certificates/notifications"
	);
	console.log("Your namespace is publicly available at", ack.soul);
});

meta.edit({
	combo: [192],
	on: function () {
		if (user.is) {
			console.log(`profile/?pub=${user.is.pub}`);
			JOY.route(`profile/?pub=${user.is.pub}`);
		}
	},
});
meta.edit({
	combo: [191],
	on: function () {
		JOY.route("search");
	},
});
meta.edit({
	combo: [49],
	on: function () {
		JOY.route("home");
	},
});
meta.edit({
	combo: [50],
	on: function () {
		JOY.route("friends");
	},
});
meta.edit({
	combo: [51],
	on: function () {
		JOY.route("activity");
	},
});
meta.edit({
	combo: [52],
	on: function () {
		JOY.route("settings");
	},
});

var routes = [
	{
		where: "home",
		icon: "home",
	},
	{
		where: "friends",
		icon: "friends",
	},
	{
		where: "activity",
		icon: "notification",
	},
	{
		where: "settings",
		icon: "settings",
	},
];
document.querySelector("#app").innerHTML = `
  <header>
    ${header}
  </header>
  <main>
    ${page}
  </main>
  <footer>
    ${nav(routes)}
  <footer>
  ${model}
  
`;
