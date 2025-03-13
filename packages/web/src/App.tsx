
import "./App.css";
import "@lynx-js/web-core/index.css";
import "@lynx-js/web-elements/index.css";
import "@lynx-js/web-core";

const App = () => {
  return (
    // @ts-ignore
    <lynx-view style={style} url="/main.web.bundle"></lynx-view>
  );
};

const style = {
  height: "100vh",
  width: "100vw",
};

export default App;