// Styles
import "./style/style.css";
import "./style/app.css";

// Scripts
import "gun/gun.js";
import "gun/sea.js";
import "./js/lib/as.js";
import "./js/lib/meta.js";

const logo = (size) => {
	return `
  <svg class="unit max" width="${size}em" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="17.431" fill="var(--background)"/>
      <path d="M20.3868 13.1076C20.3868 14.8555 18.9699 16.2725 17.222 16.2725C15.4741 16.2725 14.0571 14.8555 14.0571 13.1076C14.0571 11.3597 15.4741 9.9428 17.222 9.9428C18.9699 9.9428 20.3868 11.3597 20.3868 13.1076Z" fill="var(--green)"/>
      <path d="M8.29981 29.9136C7.06552 31.1479 7.06552 33.149 8.29981 34.3833C9.53409 35.6176 11.5353 35.6176 12.7695 34.3833L8.29981 29.9136ZM25.8238 21.329C27.0581 20.0947 27.0581 18.0936 25.8238 16.8593C24.5895 15.625 22.5884 15.625 21.3541 16.8593L25.8238 21.329ZM12.7695 34.3833L25.8238 21.329L21.3541 16.8593L8.29981 29.9136L12.7695 34.3833Z" fill="var(--yellow)"/>
      <path d="M34.6733 36.0574C35.9076 37.2917 37.9088 37.2917 39.1431 36.0574C40.3773 34.8231 40.3773 32.8219 39.1431 31.5876L34.6733 36.0574ZM31.0348 23.4794C29.8005 22.2451 27.7994 22.2451 26.5651 23.4794C25.3308 24.7137 25.3308 26.7148 26.5651 27.9491L31.0348 23.4794ZM39.1431 31.5876L31.0348 23.4794L26.5651 27.9491L34.6733 36.0574L39.1431 31.5876Z" fill="var(--red)"/>
    </svg>
`;
};

// HTML

// Theme
var storedTheme =
	localStorage.getItem("theme") ||
	(window.matchMedia("(prefers-color-scheme: dark)").matches
		? "night"
		: "day");
if (storedTheme) document.documentElement.setAttribute("theme", storedTheme);
var joy = {};

joy.tell = function (what, n) {
	var e = $("#tell").find("p");
	e.addClass("notify").text(what);
	clearTimeout(joy.tell.to);
	joy.tell.to = setTimeout(function () {
		e.removeClass("notify");
	}, n || 2500);
};
meta.edit({
	name: "home",
	combo: ["H"],
	on: (eve) => {
		as.route("home");
	},
});
meta.edit({
	name: "tell",
	combo: ["H", "T"],
	on: (eve) => {
		meta.ask("tell me something", (what) => {
			if (!what) return;
			joy.tell(what);
		});
	},
});

meta.edit({
	name: "settings",
	combo: ["S"],
	// fake: -1,
	on: (eve) => {
		as.route("settings");
	},
});
meta.edit({
	name: "theme",
	combo: ["S", "C"],
	on: function () {
		var before = document.documentElement.getAttribute("theme");
		var now = before === "day" ? "night" : "day";
		document.documentElement.setAttribute("theme", now);
		localStorage.setItem("theme", now);
		joy.tell(`${now} mode activated`);
		return;
	},
});

meta.edit({
	name: "activity",
	combo: ["A"],
	on: (eve) => {
		as.route("activity");
	},
});

as.route.page("home", function () {
	document.title = "ariob";

	$("#content").append(`
	<p>
	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc pulvinar sapien et ligula. Vitae tempus quam pellentesque nec. Porta nibh venenatis cras sed felis eget velit aliquet. Vitae semper quis lectus nulla at volutpat. Eget nunc scelerisque viverra mauris in aliquam. Lectus mauris ultrices eros in cursus turpis massa tincidunt dui. Tincidunt augue interdum velit euismod in pellentesque massa placerat. Lacus sed viverra tellus in hac habitasse platea dictumst. Tristique sollicitudin nibh sit amet commodo nulla facilisi nullam. Tincidunt dui ut ornare lectus sit amet est. Nulla facilisi morbi tempus iaculis urna id.

	Sagittis orci a scelerisque purus semper. Metus aliquam eleifend mi in nulla posuere sollicitudin. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Eu non diam phasellus vestibulum lorem. Morbi tempus iaculis urna id. Scelerisque in dictum non consectetur a erat nam at. Tortor at risus viverra adipiscing. Pretium viverra suspendisse potenti nullam. Faucibus nisl tincidunt eget nullam non nisi est sit. Sagittis eu volutpat odio facilisis mauris. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius. Ultrices tincidunt arcu non sodales neque sodales ut etiam. Elementum facilisis leo vel fringilla est ullamcorper. Fermentum et sollicitudin ac orci phasellus egestas tellus. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Eget egestas purus viverra accumsan. Eu volutpat odio facilisis mauris. Eu volutpat odio facilisis mauris.

	Purus sit amet luctus venenatis. Ipsum dolor sit amet consectetur. Ut sem nulla pharetra diam sit amet nisl suscipit. Pharetra sit amet aliquam id diam maecenas. Ante metus dictum at tempor commodo ullamcorper. Tincidunt ornare massa eget egestas purus viverra accumsan in. Nec nam aliquam sem et. Vestibulum lectus mauris ultrices eros in cursus turpis massa. Volutpat consequat mauris nunc congue nisi vitae. Sit amet aliquam id diam maecenas ultricies mi eget mauris. Sit amet nisl purus in mollis nunc sed id semper. Ut sem viverra aliquet eget sit amet. Tincidunt lobortis feugiat vivamus at augue eget arcu. Magna eget est lorem ipsum dolor. Nibh sit amet commodo nulla facilisi nullam vehicula ipsum. Eget mi proin sed libero enim sed faucibus turpis in. Ultrices dui sapien eget mi proin.

	Nunc sed augue lacus viverra vitae congue eu consequat ac. Felis donec et odio pellentesque. Egestas sed sed risus pretium quam vulputate. Elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi. Neque gravida in fermentum et. At lectus urna duis convallis convallis tellus. Urna molestie at elementum eu facilisis sed. Tristique senectus et netus et malesuada fames. In arcu cursus euismod quis viverra. Sit amet mattis vulputate enim nulla. Vitae et leo duis ut diam quam nulla porttitor massa. Sapien faucibus et molestie ac. Et tortor at risus viverra adipiscing. Cras ornare arcu dui vivamus arcu felis.

	Sed arcu non odio euismod lacinia at quis risus. A erat nam at lectus urna duis convallis. Risus ultricies tristique nulla aliquet enim tortor at auctor urna. Sed viverra ipsum nunc aliquet bibendum. Interdum varius sit amet mattis vulputate enim nulla. Ullamcorper velit sed ullamcorper morbi tincidunt ornare. Tristique risus nec feugiat in fermentum. Ultrices sagittis orci a scelerisque purus semper eget duis. Donec adipiscing tristique risus nec. Imperdiet nulla malesuada pellentesque elit eget gravida cum. Bibendum neque egestas congue quisque. Enim neque volutpat ac tincidunt vitae semper quis lectus nulla. Id nibh tortor id aliquet lectus proin nibh nisl. Eget gravida cum sociis natoque penatibus.

	Diam phasellus vestibulum lorem sed risus ultricies tristique nulla. Lectus quam id leo in vitae turpis massa. Non curabitur gravida arcu ac tortor. Elementum sagittis vitae et leo duis ut diam quam. Sit amet nisl purus in. Non diam phasellus vestibulum lorem sed risus ultricies. Donec enim diam vulputate ut pharetra sit amet aliquam id. Eu non diam phasellus vestibulum lorem sed. Molestie a iaculis at erat pellentesque. Pretium viverra suspendisse potenti nullam ac tortor. Morbi tristique senectus et netus et malesuada fames ac turpis. Turpis egestas pretium aenean pharetra magna. Eget felis eget nunc lobortis mattis aliquam. Faucibus et molestie ac feugiat sed lectus. Tincidunt arcu non sodales neque sodales ut etiam. Varius duis at consectetur lorem donec massa sapien faucibus et. Et molestie ac feugiat sed lectus.

	Turpis nunc eget lorem dolor sed viverra. Eleifend quam adipiscing vitae proin sagittis nisl. Fames ac turpis egestas sed. In fermentum posuere urna nec. Id venenatis a condimentum vitae sapien pellentesque habitant morbi. Congue nisi vitae suscipit tellus mauris. Porta lorem mollis aliquam ut porttitor leo a diam. Duis convallis convallis tellus id interdum velit. Pellentesque habitant morbi tristique senectus et netus et. Magna fermentum iaculis eu non. Lacinia quis vel eros donec. Aliquam ultrices sagittis orci a scelerisque purus semper eget duis. In iaculis nunc sed augue lacus. Aliquet lectus proin nibh nisl condimentum id venenatis a condimentum. In massa tempor nec feugiat nisl pretium. Ipsum a arcu cursus vitae congue. Id venenatis a condimentum vitae sapien pellentesque habitant. Maecenas accumsan lacus vel facilisis. Eu lobortis elementum nibh tellus. Bibendum enim facilisis gravida neque convallis.

	Eget sit amet tellus cras adipiscing enim eu. Etiam erat velit scelerisque in dictum non consectetur a erat. Diam ut venenatis tellus in metus. Vulputate enim nulla aliquet porttitor lacus luctus accumsan. Porta nibh venenatis cras sed felis eget. Tempor nec feugiat nisl pretium fusce id velit ut. Nisl rhoncus mattis rhoncus urna neque viverra. Id leo in vitae turpis. Enim tortor at auctor urna nunc. A lacus vestibulum sed arcu non odio. Laoreet non curabitur gravida arcu ac. Aliquam purus sit amet luctus venenatis. Hac habitasse platea dictumst quisque sagittis. Luctus venenatis lectus magna fringilla urna porttitor. Mi ipsum faucibus vitae aliquet nec ullamcorper sit amet. Volutpat lacus laoreet non curabitur gravida arcu. Etiam erat velit scelerisque in dictum non consectetur. Sed nisi lacus sed viverra tellus in.

	Porta non pulvinar neque laoreet suspendisse interdum consectetur libero id. Placerat duis ultricies lacus sed turpis tincidunt. Pretium aenean pharetra magna ac. Lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi. Fringilla est ullamcorper eget nulla facilisi etiam dignissim. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Aliquam nulla facilisi cras fermentum odio eu. In nisl nisi scelerisque eu ultrices. Nunc sed augue lacus viverra vitae. Dolor magna eget est lorem ipsum dolor sit amet. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Id diam maecenas ultricies mi eget mauris pharetra et.

	Massa tincidunt dui ut ornare. Nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Amet purus gravida quis blandit turpis cursus. Tempus imperdiet nulla malesuada pellentesque elit. Eu augue ut lectus arcu bibendum at varius vel. At auctor urna nunc id cursus metus aliquam eleifend mi. Ultrices in iaculis nunc sed. Sapien pellentesque habitant morbi tristique senectus et netus. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Diam quam nulla porttitor massa. A lacus vestibulum sed arcu. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Vel pharetra vel turpis nunc eget. Accumsan sit amet nulla facilisi morbi tempus iaculis. Leo vel fringilla est ullamcorper eget nulla facilisi. Duis convallis convallis tellus id interdum velit laoreet id. Quam elementum pulvinar etiam non quam. Fringilla urna porttitor rhoncus dolor purus.
	</p>
  `);
	joy.tell("welcome to ariob studio!");
});
as.route.page("activity", function () {
	document.title = "ariob - activity";
	//c.tell('In Activity')
});
as.route.page("settings", function () {
	document.title = "ariob - settings";
	//c.tell('In Settings')
});

document.querySelector("#app").innerHTML = `
  <div id="home" class="page hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">ariob</p>
      </div>
    </div>
    
    <div id="content" class="center gap leak">
      <p>home</p>
    </div>
    
  </div>
  
  <div id="settings" class="page full center hold">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">settings</p>
      </div>
    </div>
    
    <div class="center pad">
      <p>settings</p>
    </div>
    
  </div>
  <div id="activity" class="page full hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">activity</p>
      </div>
    </div>
   
    <div class='model'>
      <p class'rand'> { content }</p>
    </div>
    <div class="center pad">
      <p>activity</p>
    </div>
    
  </div>
  <div id="friends" class="page full hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">Friends</p>
      </div>
    </div>
    
    <div class="center pad">
      <p>Friends</p>
    </div>
    
  </div>
`;
