import logo from "./logo.js";
import icon from "./icon.js";
const header = `
    <div id="header" class="unit row center">
      <div class="unit gap left">
        <p id="place" class="unit right loud"></p>
      </div>
      <div>
      <div class="rim">
        <div class="rim  right" id="account">
          <a class='unit act but primary right' href="#create">Join</a>
        </div>
        <div class="rim right">
          <a class="gap right" href='#activity'>${icon("notification")}</a>
            <a class="gap right" href='#search'>${icon("search")}</a>
        </div>
      </div>
    </div>
  `;
export default header;
