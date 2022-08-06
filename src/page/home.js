import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
	${header("Home")}
	<div class="center gap leak">
		<p>Home</p>
	</div>
</div>
`;
JOY.route.page("home", function () {
	document.title = "Home";
});

meta.edit({
	name: "Home",
	combo: ["H"],
	on: (eve) => {
		JOY.route("home");
	},
});
meta.edit({
	name: "Task",
	combo: ["H", "T"],
	on: (eve) => {
		meta.ask("Enter a name for your new task", (name) => {
			 
		});
		// joy.render("", "", );
	},
});
export default home;
