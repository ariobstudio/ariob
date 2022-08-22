import "./style/style.css";
import "./style/app.css";
import "gun/gun.js";
import "gun/sea.js";
import "gun/lib/utils.js";
import "./lib/as.js";
import "./lib/chain.js";
import "./lib/joy.js";
import "./lib/meta.js";
import "./style/index.js";

import nav from "./component/nav.js";
import header from "./component/header.js";
import home from "./page/home.js";
import search from "./page/search.js";
import settings from "./page/settings.js";
import activity from "./page/activity.js";
import profile from "./page/profile.js";
import persona from "./model/persona.js";
import notification from "./model/notification.js";
import { create, auth } from "./page/auth.js";

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
		var pub = '~' + user.is.pub;
		$me.html("");
		$me.removeClass('primary')
		$me.addClass('rim sap')
		$me.removeClass('act')
		$me.attr("href", `#profile/${pub}`);
    user.get("profile").on((d) => {
      console.log(location.hash + "updating")
			JOY.route.render("my", ".persona-mini", $me, {
				avatar: {
				  src: JOY.avatar(d.avatar)
				}
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
/*meta.edit({
  name: "∷",
  fake: -1,
  combo: ["X"]
})*/
var routes = [
  {
    where: "home", 
    icon:'home'
  },
  {
    where: "activity", 
    icon:'notification'
  },
  {
    where: "settings", 
    icon:'settings'
  }
]
document.querySelector("#app").innerHTML = `
  <header>
    ${header()}
  </header>
  
  <main>
    ${activity}
    ${home}
    ${settings}
    ${profile}
    ${create}
    ${auth}
    ${search}
  </main>
  <footer>
    ${nav(routes)}
  <footer>
  <div class="model">
	  ${notification}
	  ${persona}
  </div>
`;
