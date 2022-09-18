import logo from "./logo.js";
import icon from "./icon.js";
const header = `
    <div id="header" class="unit row rim center">
      <div class="rim  right" id="account">
        <a class='unit act but primary right' href="#create">Join</a>
      </div>
      <div class="flex rim right">
        <a class="gap" href='#activity'>${icon("notification")}</a>
          <a class="gap" href='#search'>${icon("search")}</a>
      </div>
      <div class="unit rim left">
        <p id="place" class="unit left loud"></p>
      </div>
    </div>
  `;
export default header;
