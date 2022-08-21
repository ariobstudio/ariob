import header from "../component/header.js";

const search = `
<div id="search" class="page hold center">
	<div class="center screen gap leak">
	  <form id="search">
	    <input class='surface gap unit max row' id='query' placeholder='Search'/>
	  </form>
		<p></p>
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
