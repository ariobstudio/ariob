import icon from "../component/icon";
const paper = `
<div class="paper-card">
    <li class='unit sap'>
		<a name="link" class="unit">
			<div >
				<img class="icon-cover sap" name="cover"/>
			</div>
			<p class="unit gap" name='name'></p>
		</a>
		<div class="max">
			<button name="data-link" class="share green">${icon("share")}</button>
			<button name="data-paper" class="delete red">${icon("trash")}</button>
		</div>		
	</li>
</div>
`;

export default paper;
