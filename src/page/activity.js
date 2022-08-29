import header from "../component/header.js";

const activity = `
<div id="activity" class="page hold center">
	<div class="center screen gap hold">
	  <ul id="activities">
	  </ul>
	</div>
</div>
`;

JOY.route.page("activity", function () {
	var notifications = {};
	// .get("notifications").
	JOY.head("Activity");
	console.log(JOY.user.is);
	gun.get(`@${JOY.key.pub}`)
		.get("notifications")
		.map()
		.on(async (d, k) => {
			console.log(d);
			if (!d) return;
			var notification = d.data;
			var secret = await SEA.secret(d.epub, JOY.key);
			var decrypted = await SEA.decrypt(notification, secret);
			console.log(decrypted);
			// var decrypted = await SEA.decrypt(notification.data, JOY.key.epub);
			// console.log(decrypted);
			// return;
			console.log(decrypted);
			var soul = k;
			var pub = "~" + decrypted.from;
			var who = await gun.getUsername(pub);
			console.log(pub);
			JOY.route.render(soul, ".notification-ask", $("#activities"), {
				from: {
					"data-from": pub,
				},
				message: `${who} is requesting to connect with you!`,
				when: new Date(decrypted.created).toLocaleDateString("en-US", {
					hour: "numeric",
					minute: "numeric",
				}),
			});
		});

	// async function render(n) {
	// 	for (let [soul, notification] of Object.entries(n)) {
	// 		console.log(soul, node);
	// 		if (!node) return;

	// 		console.log("RENDERED");
	// 	}
	// }
	$(".accept").click(function () {
		var from = $(this).parent().attr("data-from");
		var soul = $(this).parent().parent().parent();
		gun.get(`@${JOY.key.pub}`)
			.get("notifications")
			.get(soul.attr("id"))
			.put(null);
		soul.remove();
		JOY.user.get("friends").set(from);
	});
	$(".reject").click(function () {
		// var from = $(this).parent().attr("data-from");
		var soul = $(this).parent().parent().parent();
		gun.get(`@${JOY.key.pub}`)
			.get("notifications")
			.get(soul.attr("id"))
			.put(null);
		soul.remove();
	});
	meta.edit({
		name: "Clear",
		place: "activity",
		combo: ["C"],
	});
});

export default activity;
