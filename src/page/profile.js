import header from "../component/header.js";

const profile = `
<div id="profile" class="page hold center">
	${header("Profile", true)}
	<div class="center gap leak">
		<div name="profile">
		  {{ name }}
		</div>
		<button id="cpk">Copy Key</button>
	</div>
</div>
`;

JOY.route.page("profile", function () {
	document.title = "Profile";
  var pub = location.hash.split('/').slice(-1)[0]
  console.log(pub)
  $('#profile').attr('name', pub);
  $("#cpk").click(()=>{
    navigator.clipboard.writeText(JSON.stringify(JOY.key))
  });
});

export default profile;
