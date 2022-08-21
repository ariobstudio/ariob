import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
  ${header('Home')}
	<div class="center gap leak">
		<p>Dashboard</p>
	</div>
</div>
`;
JOY.route.page("home", function () {
	document.title = "Home";
	meta.edit({
	  name: "Create",
	  combo: ["C"],
	  on: (eve) => {
		// joy.render("", "", );
	  },
  });
	
});


export default home;
