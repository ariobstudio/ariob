import logo from '../component/logo.js';

const create = `
  <div id="create" class="page hold center">
    <div class="center gap air">
      <a href="#home">${logo(5)}</a>
      <input class='center' id='alias' placeholder='Who are you?'/>
      <div class='unit row gap'>
        <button id="create">Get Started</button>
      </div>  
      <a href='#auth' class='act surface'>Already have an account</a>
    </div>
  </div>
`

const auth = `
  <div id="auth" class="page hold center">
    <div class="center gap leak air">
      <a href="#home">${logo(5)}</a>
      <input class='center' id='key' placeholder='Paste your key.'/>
      <div class='unit row gap'>
        <button id="auth">Go</button>
      </div>
      <div class='unit row crack'>
        <a href='#create' class='rim act surface'>Create an account</a>
      </div>
      <a href='#forgot' class='rim act'>Lost my keys</a>
    </div>
  </div>
`

export { create, auth }