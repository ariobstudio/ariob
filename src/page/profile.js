import header from "../component/header.js";

const profile = `
<div id="profile" class="page hold center">
	<div id="profile-header">
	</div>
	<div class="center gap leak">
		<div id="persona">
		</div>
		<div class='mine none'>
		  <button id="cpk">Copy Key</button>
		  
		</div>
		<div class='their'>
		  <button id="conn">Connect</button>
		</div>
	</div>
</div>
`;

JOY.route.page("profile", async function () {
	document.title = "Profile";
  var pub = location.hash.split('/').slice(-1)[0]
  gun.get(pub).get('profile').on((p)=>{
    console.log(p)
    JOY.route.render('p','.persona-main', $("#persona"), {
    name: p.name,
    avatar: {
      src: 'https://vibatar.herokuapp.com/4.x/big-smile/svg?seed=' + p.avatar}
    })
  })
  if (!JOY.key) {
    $("#profile-header").html(header('Profile'))
    $('.their').addClass('none')
    return 
  }
  $("#profile-header").html(header('Profile', true))
  if (JOY.key && '~' + JOY.key.pub === pub) {
    $('.their').addClass('none')
    $('.mine').removeClass('none')
    meta.edit({
  	name: "Avatar",
  	combo: ["A"],
  	on: async (eve) => {
  		var avatar = await SEA.work(Gun.text.random(16), null, null, {name: "SHA-256"})
      JOY.user.get('profile').get('avatar').put(avatar)
	  },
  });
  }

  
  
  $("#cpk").click(()=>{
    navigator.clipboard.writeText(JSON.stringify(JOY.key))
  });
  
  $("#conn").click(async ()=>{
    var name = await gun.getUsername(pub)
    JOY.tell("Successfully sent request to "+ name)
    JOY.user.sendNotification(pub, {
			data: JOY.user.is.pub,
			type: "friend-request",
			createdAt: Date.now(),
		});
		
		//user.notify(pub, true);
		//user.generateCert(pub, { "*": "friends" }, "certificates/friends");

  })
  
});


export default profile;
