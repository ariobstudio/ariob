import header from "../component/header.js";

const settings = `
<div id="settings" class="page hold center">
  ${header("Settings")}
	<div class="center screen gap leak">
		<p>Settings</p>
	</div>
</div>
`;

JOY.route.page("settings", function () {
	document.title = "Settings";

	meta.edit({
		name: "Logout",
		combo: ["L"],
		on: (eve) => {
			JOY.user.leave();
			localStorage.removeItem("key");
			location.reload();
			JOY.key = {};
		},
	});
	meta.edit({
		name: "Theme",
		combo: ["T"],
		on: function () {
			var before = document.documentElement.getAttribute("theme");
			var now = before === "day" ? "night" : "day";
			document.documentElement.setAttribute("theme", now);
			localStorage.setItem("theme", now);
			JOY.tell(
				`${now.charAt(0).toUpperCase() + now.slice(1)} mode enabled.`
			);
			return;
		},
	});
});

export default settings;
