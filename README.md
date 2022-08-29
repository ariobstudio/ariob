# Ariob

This project serves as a template for building JavaScript apps with ease. It uses [JOY](https://github.com/eraeco/joy) as a guideline for building the tools and also meta for creating seamless command framework for keyboard shortcuts and action menu for mobile.

## File Structure

### src/lib

Contains library files that is used throughout the framework.

<br/>

### src/page

A page is created by exporting an html template from a string. Then by using `JOY.route.page("example", cb)` the callback is called when that page is visible. The first argument of `JOY.route.page(hash, cb)` should be the same as the id -- which is a hash for the page that is accessed as follows `http://example.com/#example`. A page has following structure as a template.

```JavaScript
// Example page
const example = `
    <div id="example" class="page">
        <div id="profile"></div>
    </div>
`;
const temp = JOY.route;
.page("example", function () {
    // Code goes here
    console.log("I'm running when this page loads");
    document.title = "Example";
});

export default example;
```

<br/>

### src/modal

A modal is a component that can be rendered to any html by passing some data to it. As an example lets try to render a profile picture and a name inside the profile div above.

> ./src/modal/index.js

```JavaScript
const modals = `
<div class="modal">
    <div class="profile">
        <img name="avatar" alt="profile-pic"/>
        <p name="username"></p>
    </div>
</div>
`
```

> ./src/page/example.js

```JavaScript
temp.page("example", function() {
    temp.render("my-profile", ".profile", $("#profile"), {
        name: "Alice"
        avatar: {
            src: "http://...."
        }
    })
    // my-profile - is used as an id for the rendered element
    // .profile - is used to select the modal from all the modals
    // $("#profile") = is the place where the modal is going to be rendered to
    // {...} - is an object that is going to replace the elements with the name attribute
    // if its an object the name of the key inside the object is going to be attribute for the element
})
```

There are number of apps that can be built simply by playing around with this framework.
