import logo from "../component/logo.js";

const create = `
<div id="create" class="page hold center">
  <div class="center gap air">
    <div class="unit row gap">
      <a href="#home">${logo(5)}</a>
    </div>

    <form id="signup">
      <input class='center unit max row' id='alias' placeholder='Who are you?'/>
      <div class='unit row gap'>
        <input class="act primary" type="submit" value="Get Started" />
      </div>  
    </form>

    <div class='unit row gap'>
      <a href='#auth' class='act surface'>Already have an account</a>
    </div>

  </div>
</div>`;

const auth = `
<div id="auth" class="page hold center">
  <div class="center gap leak air">
    <div class="unit row gap">
      <a href="#home">${logo(5)}</a>
    </div>
      
    <form id="signin">
      <input class='center unit max row' id='key' placeholder='Paste your key.'/>
      <div class='unit row gap'>
        <input class="act primary" type="submit" value="Login" />
      </div>
    </form>

    <div class='unit row gap'>
      <a href='#create' class='rim act surface'>Create an account</a>
    </div>

    <a href='#forgot' class='rim act'>Lost my keys</a>
  </div>
</div>
`;

JOY.route.page("auth", function () {
	document.title = "Existing account";
	var key = $("#key");
	key.focus();
	var $form = $("#signin");
	$form.submit(function (e) {
		e.preventDefault();
		JOY.auth(
			JSON.parse(key.val()),
			(ack) => {
			  if (!ack.err) {
				  JOY.route("home");
			  } else {
			    JOY.tell(ack.err);
			  }
			}
		);
	});
});

JOY.route.page("create", function () {
	document.title = "Create an account";
	var name = $("#alias");
	name.focus();
	var $form = $("#signup");
	$form.submit(function (e) {
		e.preventDefault();

		JOY.auth(
			null,
			async (ack) => {
			  var avatar = await SEA.work(JOY.key.pub, null, null, {name: "SHA-256"})
				await JOY.user.generateCert(
				"*",
				[{ "*": "notifications" }, { "*": "notify" }],
				"certificates/notifications"
			  );
				JOY.user.get("profile").get("name").put(name.val());
				JOY.user.get("profile").get("avatar").put(avatar);
				
				JOY.route("home");
			},
			true
		);
	});
});

export { create, auth };
