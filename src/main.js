import "./style/style.css";
import "./style/app.css";
import "gun/gun.js";
import "gun/sea.js";
import "./lib/as.js";
import "./lib/chain.js";
import "./lib/joy.js";
import "./lib/meta.js";
import "./style/index.js";

import nav from "./component/nav.js";
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
		var $me = $("#account a");
		var pub = ack.soul
		$me.html("");
		$me.attr("href", `#profile/${pub}`);
		
		var n = await gun.get(pub).get('profile').get('name')
    var a = await gun.get(pub).get('profile').get('avatar') 
    console.log(a)
    JOY.route.render("my", ".persona-mini", $me, {
		  name: n
      });
	}
	console.log("Your namespace is publicly available at", ack.soul);
});
/*meta.edit({
  name: "∷",
  fake: -1,
  combo: ["X"]
})*/

document.querySelector("#app").innerHTML = `
  ${activity}
  ${home}
  ${settings}
  ${profile}
  ${create}
  ${auth}
  ${search}
  ${nav()}
  <div class="model">
	  ${notification}
	  ${persona}
  </div>
`;
