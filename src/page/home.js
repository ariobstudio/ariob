import header from "../component/header.js";
import icon from "../component/icon.js";
const home = `
<div id="home" class="page hold">
	<div class="center screen">
		<div id="drafts" class="flex">
		</div>
	</div>
</div>
`;
var user = JOY.user;
var colors = ["green", "yellow", "red", "blue"];
JOY.route.page("home", function () {
	JOY.head("Home");
	JOY.user
		.get(`test/paper/files`)
		.map()
		.on(async (d, k) => {
			// if (!d?.when || !d?.document || !d?.name) return;
			if (!d || !d?.document || !d?.when) return;
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
				cover: {
					src: d.cover,
					class: `icon-cover sap ${
						colors[Math.floor(Math.random() * colors.length)]
					}`,
				},
				name: `${d.name || `Untitled-${k}`}`,
				when: when,
			});
			$(".delete").on("click", function (e) {
				e.preventDefault();
				let p = $(this).attr("data-paper");
				// $(p.parent().get(0)).remove();
				console.log();
				$(this).parent().parent().remove();
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
		name: "Create",
		combo: ["C"],
		fake: -1,
		on: () => {
			var key = JOY.key;
			if (!key) {
				JOY.tell("Join to save your data!");
				return;
			}
			var uuid = Gun.text.random(11);
			var url = `#paper/?file=${uuid}&?pub=${JOY.key.pub}`;
			JOY.user
				.get(`test/paper/files`)
				.get(uuid)
				.put({
					name: "Untitled-" + uuid.slice(0, 4),
				})
				.on((d) => {
					JOY.route(url);
				});
		},
	});
});

export default home;
