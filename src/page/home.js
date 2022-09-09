import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
	<div class="center screen gap leak">
		<div id="papers">
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
			console.log(d, k);
			var when = JOY.since(new Date(d.when));
			JOY.route.render(k, ".paper-card", $("#papers"), {
				link: {
					href: `#paper/?file=${k}&?pub=${JOY.key.pub}`,
				},
				name: `${d.name}`,
				when: when,
			});
		});
	meta.edit({
		name: "New",
		fake: -1,
		place: "home",
		combo: ["N"],
		on: () => {
			var key = JOY.key;
			// var id = SEA.random(7).toString("hex");
			// var pass = SEA.random(11).toString("hex");
			// console.log("PAGE: PUB: ", key.pub);
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
