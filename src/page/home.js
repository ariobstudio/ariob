import header from "../component/header.js";

const home = `
<div id="home" class="page hold center">
	<div class="center screen gap leak">
		<p>Dashboard</p>
	</div>
</div>
`;
var user = JOY.user
JOY.route.page("home", function () {
  console.log(meta)
	document.title = "Home";
	place.textContent = "Home"
});

export default home;
