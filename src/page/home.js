import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
	<div class="center screen gap">
		<p class="col center loud">Recents</p>
		<div id="drafts" class="flex">
		</div>
	</div>
</div>
`;
var user = JOY.user;
JOY.route.page("home", function () {
	JOY.head("Home");
	JOY.user
		.get(`test/paper/files`)
		.map()
		.on(async (d, k) => {
			// if (!d?.when || !d?.document || !d?.name) return;
			if (!d) return;
			console.log(d);
			var when = JOY.since(new Date(d.when));
			JOY.route.render(k, ".paper-card", $("#drafts"), {
				"data-paper": {
					"data-paper": k,
				},
				"data-link": {
					"data-link": `#paper/?file=${k}&?pub=${JOY.key.pub}`,
				},
				link: {
					href: `#paper/?file=${k}&?pub=${JOY.key.pub}`,
				},
				name: `${d.name || `Untitled-${k}`}`,
				when: when,
			});
			$(".delete").on("click", function (e) {
				e.preventDefault();
				let p = $(this).attr("data-paper");
				$(`#${k}`).remove();
				JOY.user.get(`test/paper/files`).get(p).put(null);
				JOY.tell("Successfully Deleted!");
			});
			$(".share").on("click", function (e) {
				e.preventDefault();
				let p = $(this).attr("data-link");
				navigator.clipboard.writeText(location.origin + p);
				JOY.tell("Copied! Share this with others!");
			});
			var dup = {};
			$("#drafts")
				.children()
				.each(function () {
					if (dup.hasOwnProperty(this.id)) {
						$(this).remove();
					} else {
						dup[this.id] = "true";
					}
				});
		});
	meta.edit({
		name: "New",
		fake: -1,
		place: "home",
		combo: ["N"],
		on: () => {
			var key = JOY.key;
			if (!key) {
				JOY.tell("Join to save your data!");
				return;
			}
			SEA.work(SEA.random(7) + key.pub, null, null, {
				name: "SHA-256",
			}).then(function (hash) {
				var url = `#paper/?file=${hash.slice(0, 7)}&?pub=${
					JOY.key.pub
				}`;
				JOY.route(url);
				// page.start();
			});
		},
	});
});

export default home;
