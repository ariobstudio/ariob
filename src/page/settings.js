import header from "../component/header.js";

const settings = `
<div id="settings" class="page hold center">

	<div class="center screen gap leak">
		<p class="gap">Coming Soon...</p>
		<button id="install">Install</button>
	</div>
</div>
`;
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
	$("#install").show();
	deferredPrompt = e;
});
JOY.route.page("settings", function () {
	JOY.head("Settings");
	$("#install").on("click", async () => {
		if (deferredPrompt !== null) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === "accepted") {
				deferredPrompt = null;
			}
		}
	});
	meta.edit({
		place: "settings",
		name: "Logout",
		fake: -1,
		combo: ["L"],
		on: (eve) => {
			JOY.user.leave();
			localStorage.removeItem("key");
			location.reload();
			JOY.key = {};
		},
	});
	meta.edit({
		place: "settings",
		name: "Theme",
		fake: -1,
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
