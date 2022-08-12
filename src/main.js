import "./style/style.css";
import "./style/app.css";
import "gun/gun.js";
import "gun/sea.js";
import "./lib/as.js";
import "./lib/joy.js";
import "./lib/meta.js";
import "./style/index.js";

import home from "./page/home.js";
import search from "./page/search.js";
import settings from "./page/settings.js";
import activity from "./page/activity.js";
import profile from "./page/profile.js";
import user_card from "./model/user_card.js";
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

gun.on("auth", function (ack) {
	if (!storedKey) {
		localStorage.setItem("key", JSON.stringify(JOY.key));
	}
	if (ack.soul) {
		var $me = $("#account a");
		$me.html("");
		$me.attr("href", `#profile/${ack.soul}`);
		user.get("profile")
			.get("name")
			.once((data) => {
			  console.log(data)
			 
				JOY.route.render("my", ".profile", $me, {
					name: data,
				});
			});
	}
	console.log("Your namespace is publicly available at", ack.soul);
});

document.querySelector("#app").innerHTML = `
  ${activity}
  ${home}
  ${settings}
  ${profile}
  ${create}
  ${auth}
  ${search}
  <div class="model">
	  ${user_card}
  </div>
`;
