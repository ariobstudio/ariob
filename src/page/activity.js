import header from "../component/header.js";

const activity = `
<div id="activity" class="page hold center">
  ${header('Activity')}
	<div class="center gap leak">
	  <ul id="activities">
	    
	  </ul>
	</div>
</div>
`;
var notifications = {}
JOY.route.page("activity", function () {
	document.title = "Activity";
	
	JOY.user.get('notifications').map().on((data, soul) => {
	  notifications[soul]=data
	  render(notifications)
	})
	
	async function render(n) {
	  
	  for (let [soul, node] of Object.entries(n)) {
	      var who = await gun.getUsername('~'+node.data)
	      
	      JOY.route.render(soul, ".notification", $("#activities"), {
	          message: "Sent from "+who,
	          when: new Date(node.createdAt).toLocaleDateString('en-US', {
            hour: 'numeric',
            minute: 'numeric'
	        })
	        })
	      console.log(node)
	    }
	  
	}
});

export default activity;
