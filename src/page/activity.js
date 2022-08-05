import header from "../component/header.js";

const activity = `
<div id="activity" class="page hold center">
	${header("Activity")}
	<div class="center gap leak">
		<p>Activity</p>
	</div>
</div>
`;

meta.edit({
	name: "Activity",
	combo: ["A"],
	on: (eve) => {
		JOY.route("activity");
	},
});

JOY.route.page("activity", function () {
	document.title = "Activity";
});

export default activity;
