import "./style/style.css";
import "./style/app.css";
import "gun/gun.js";
import "gun/sea.js";
// import "@benrbray/prosemirror-math/style/math.css";
// import "katex/dist/katex.min.css";
import "./lib/as.js";
import "./lib/chain.js";
import "./lib/joy.js";
import "./lib/meta.js";
import "./style";
Gun.log.off = true;
// import "@benrbray/prosemirror-math/style/math.css";
import "./style/math.css";
import "katex/dist/katex.min.css";
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
			console.log("Avatar: ", d.avatar);
			JOY.route.render("my", ".persona-mini", $me, {
				avatar: {
					src: JOY.avatar(d.avatar),
				},
			});
		});
	}
	console.log("Your namespace is publicly available at", ack.soul);
});

// first, find all the div.code blocks

if (!location.hash) {
	JOY.route("home");
}
var prevScrollpos = window.pageYOffset;
var x = window.matchMedia("(min-width: 600px)");
window.onscroll = function () {
	var currentScrollPos = window.pageYOffset;
	if (prevScrollpos > currentScrollPos) {
		if (x) {
			document.getElementById("nav").style.bottom = "0";
			document.getElementById("meta").style.display = "block";
		} else {
		}
	} else {
		if (x) {
			document.getElementById("meta").style.display = "none";
			document.getElementById("nav").style.bottom = "-10em";
		}
	}
	prevScrollpos = currentScrollPos;
};

// meta.edit({
// 	combo: [192],
// 	on: function () {
// 		if (user.is) {
// 			console.log(`profile/?pub=${user.is.pub}`);
// 			JOY.route(`profile/?pub=${user.is.pub}`);
// 		}
// 	},
// });
// meta.edit({
// 	combo: [191],
// 	on: function () {
// 		JOY.route("search");
// 	},
// });
// meta.edit({
// 	combo: [49],
// 	on: function () {
// 		JOY.route("home");
// 	},
// });
// meta.edit({
// 	combo: [50],
// 	on: function () {
// 		JOY.route("friends");
// 	},
// });
// meta.edit({
// 	combo: [51],
// 	on: function () {
// 		JOY.route("activity");
// 	},
// });
// meta.edit({
// 	combo: [52],
// 	on: function () {
// 		JOY.route("settings");
// 	},
// });

var routes = [
	{
		where: "friends",
		icon: "friends",
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
