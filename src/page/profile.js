const profile = `
<div id="profile" class="page hold center">

	<div class="center pad screen gap leak">
		<div id="persona">
		</div>
		<div class='mine'>
		  <button id="cpk">Copy Key</button>
		</div>
		<div class='their'>
			<button id="conn">Add Friend</button>
      		<button id="share">Share</button>
		</div>
		<div id="profile-view" class="unit row min">
			<h3 class="tab left act">Friends</h3>
			<h3 class="tab left act surfacet">Posts</h3>
		</div>
		<ul id='others'></ul>
	</div>
</div>
`;

JOY.route.page("profile", async function (a) {
	JOY.head("Profile", true);
	var url = new URLSearchParams(location.hash.split("/")[1]);
	var pub = url.get("pub");
	$(".mine").addClass("none");
	$(".their").addClass("none");
	gun.get(pub)
		.get("profile")
		.on(async (p) => {
			JOY.route.render("p", ".persona-main", $("#persona"), {
				username: p.name,
				avatar: {
					src: JOY.avatar(p.avatar),
				},
			});
			JOY.user
				.get("friends")
				.map()
				.on((a) => {
					if (a == pub) {
						$("#conn").addClass("none");
					}
				});
		});
	$("#profile-view .tab").each((i, tab) => {
		$(tab).click(function () {
			$(this).removeClass("surfacet");
			$(this).siblings(".tab").addClass("surfacet");
			$("#others").empty();
			render(pub, $(this).text());
		});
		if ($(tab).hasClass("surfacet")) {
			return;
		}
		render(pub, $(tab).text());
	});
	function render(p, t) {
		if (t == "Friends") {
			gun.get(p)
				.get("friends")
				.map()
				.on(async (d, k) => {
					if (!d) return;

					var friend = await gun.get(d).get("profile");
					JOY.route.render(
						d.substring(1, 8),
						".persona-friend",
						$("#others"),
						{
							avatar: {
								src: JOY.avatar(friend.avatar),
							},
							link: {
								href: `#profile/?pub=${d}`,
							},
							name: friend.name,
						}
					);
				});
		}
	}
	meta.edit({
		place: "profile",
		name: "Share",
		combo: ["S"],
		on: async (eve) => {
			navigator.clipboard.writeText(location.href);
		},
	});
	if (JOY.key && `~${JOY.key.pub}` === pub) {
		$(".mine").removeClass("none");
		meta.edit({
			place: "profile",
			name: "Avatar",
			combo: ["A"],
			on: async (eve) => {
				var avatar = await SEA.work(Gun.text.random(16), null, null, {
					name: "SHA-256",
				});
				JOY.user.get("profile").get("avatar").put(avatar);
			},
		});

		var username = $("p[name='username']");
		if (JOY.key && "~" + JOY.key.pub === pub) {
			if (!username.text()) {
				username.text("Double Tap!");
			}
			username.addClass("noselect");
			username.on("dblclick", function () {
				meta.ask(
					"Change username",
					(name) => {
						JOY.user.get("profile").get("name").put(name);
					},
					null,
					true
				);
			});
		}
		$("#cpk").click(() => {
			navigator.clipboard.writeText(JSON.stringify(JOY.key));
		});
		return;
	} else {
		$(".their").removeClass("none");
	}

	$("#conn").click(() => {
		JOY.user.connect(pub);
	});
	$("#share").click(() => {
		navigator.clipboard.writeText(location.href);
	});
});

export default profile;
