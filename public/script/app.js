import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Menu from "./component/menu";
import Graph from "./component/graph";
import "./../style/output.css";

@Component
class App extends H12.Component {
    constructor() {
        super();
        this.AutoGenerateEnabled = false;
    }
    async init() {

        setTimeout(() => {
            Dispatcher.Call("LoadGraph");
        }, 500);
        
    }
    async render() {

        return <>
            <div class="w-full h-full overflow-auto scroll">
                <div class="flex h-full">
                    <Menu args id="menu"></Menu>
                    <Graph args id="graph"></Graph>
                </div>
            </div>
        </>;

    }
};

H12.Component.Render(App, ".app");