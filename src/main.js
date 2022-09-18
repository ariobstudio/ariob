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
// import "./page/paper/index";

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
		}
	} else {
		if (x) {
			//document.getElementById("meta").style.display = "none";
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
if (!location.hash) {
	JOY.route("home");
}
document.querySelector("#app").innerHTML = `

<header>
${header}
</header>
<div id="loader" class="full hold"><div id="spinner"></div></div>

  <main>
    ${page}
  </main>
  <footer>
    ${nav(routes)}
  <footer>
  ${model}

`;
var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
	e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
	if (keys[e.keyCode]) {
		preventDefault(e);
		return false;
	}
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
	window.addEventListener(
		"test",
		null,
		Object.defineProperty({}, "passive", {
			get: function () {
				supportsPassive = true;
			},
		})
	);
} catch (e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent =
	"onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

// call this to Disable
function disableScroll() {
	window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
	window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
	window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
	window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
	window.removeEventListener("DOMMouseScroll", preventDefault, false);
	window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
	window.removeEventListener("touchmove", preventDefault, wheelOpt);
	window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}
$(window).on("load", function () {
	disableScroll();
	setTimeout(() => {
		$("#loader").hide();
		enableScroll();
	}, 700);
});
