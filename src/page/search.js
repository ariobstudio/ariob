import header from "../component/header.js";

const search = `
<div id="search" class="page hold center">
	<div class="center screen gap leak">
	  <form id="search">
	    <input class='surface focus gap unit max row' id='query' placeholder='Search'/>
	  </form>
		<p class='gap'>No recent searches</p>
	</div>
</div>
`;

JOY.route.page("search", function () {
	document.title = "Search";
	var $search = $("#query");
	$search.focus();
	var $form = $("#search");
	$form.submit(function (e) {
		e.preventDefault();
		$search.val("");
	});
});

export default search;
