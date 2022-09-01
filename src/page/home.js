import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
	<div class="center screen gap leak">
		<p>Dashboard</p>
	</div>
</div>
`;
var user = JOY.user;
JOY.route.page("home", function () {
	JOY.head("Home");
	meta.edit({
		name: "New",
		place: "home",
		combo: ["N"],
		on: () => {
			var key = JOY.key;
			var id = SEA.random(7).toString("hex");
			// var pass = SEA.random(11).toString("hex");
			console.log("PAGE: PUB: ", key.pub);
			SEA.work(key.pub, null, null, {
				name: "SHA-256",
			}).then(function (hash) {
				gun.get(`test-paper#`)
					.get(hash)
					.put(key.pub)
					.on((d, k) => console.log(d, "----", k));
				var url = `#paper/?p=${id}&?h=${hash}`;
				JOY.route(url);

				// page.start();
			});
		},
	});
});

export default home;
