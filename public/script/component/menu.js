import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

@Component
class Menu extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        Dispatcher.On("InterfaceDisable", this.Disable.bind(this));
        Dispatcher.On("InterfaceEnable", this.Enable.bind(this));
        Dispatcher.On("SetNodeURL", this.SetNodeURL.bind(this));
        Dispatcher.On("SetNodeInformation", this.SetNodeInformation.bind(this));
        Dispatcher.On("SetNodeMessage", this.SetNodeMessage.bind(this));
        Dispatcher.On("SetNodeCount", this.CountNode.bind(this));
        
        this.Set("{node.generate}", "Disabled");
        this.Set("{node.info}", "");

        this.Set("{count.node}", 0);
        this.Set("{count.link}", 0);

    }
    async render() {

        return <>
            <div class="bg-gray-200 p-6 overflow-hidden space-y-6" style="min-width: 256px;max-width: 256px;">
                <div class="flex flex-col">
                    <label class="font-bold">Stardust.<label class="text-xs">v0.1</label> </label>
                    <label class="font-bold text-xs">Create Node</label>
                </div>
                <div class="flex flex-col space-y-2">
                    <input type="text" placeholder="Enter URL" class="text-xs p-2 bg-gray-50 border border-gray-400 rounded-md" id="box1" />
                    <button class="text-xs p-2 w-auto disabled:bg-gray-400 disabled:border-gray-400 bg-blue-400 border border-blue-500 rounded-md" id="createnode" onclick={ this.CreateNode }>Create</button>
                    <button class="text-xs p-2 w-auto disabled:bg-gray-400 bg-gray-300 border border-gray-400 rounded-md" id="reloadgraph" onclick={ this.LoadGraph }>Reload</button>
                    <button class="text-xs p-2 w-auto disabled:bg-gray-400 bg-gray-300 border border-gray-400 rounded-md" id="autograph" onclick={ this.SetAutoLoad }>Node Auto Generate: {node.generate}</button>
                </div>
                <div class="flex flex-col space-y-1 break-words">
                    <label class="font-bold text-xs">Count:</label>
                    <label class="text-xs">Nodes: {count.node}</label>
                    <label class="text-xs">Links: {count.link}</label>
                </div>
                <div class="flex flex-col space-y-1 break-words">
                    <label class="font-bold text-xs">Node Information:</label>
                    <label class="text-xs">{node.info}</label>
                    <label class="font-bold text-xs">{node.message}</label>
                </div>
            </div>
        </>;

    }

    async CountNode() {

        //Get count data
        let _response = await fetch(`http://localhost:3000/api/node/count`);
        let _data = await _response.json();

        //If success
        if(_data.success) {
            this.Set("{count.node}", _data.data.nodes);
            this.Set("{count.link}", _data.data.links);
        };

    }

    Disable(disable = true) {
        this.element.box1.disabled = disable;
        this.element.createnode.disabled = disable;
        this.element.reloadgraph.disabled = disable;
        this.element.autograph.disabled = disable;
        this.Set("{node.message}", "working on...");
    }
    Enable() {
        this.Disable(false);
        this.Set("{node.message}", "");
    }

    LoadGraph() {
        Dispatcher.Call("LoadGraph");
    }
    CreateNode() {
        console.log(this.element.box1.value)
        Dispatcher.Call("CreateNode", this.element.box1.value)
    }

    SetNodeInformation({ detail }) {
        this.Set("{node.info}", detail);
    }
    SetNodeURL({ detail }) {
        this.element.box1.value = detail;
    }
    SetNodeMessage({ detail }) {
        this.element.nodeload = detail;
    }
    SetAutoLoad() {
        this.parent.AutoGenerateEnabled = !this.parent.AutoGenerateEnabled;
        this.Set("{node.generate}", (this.parent.AutoGenerateEnabled) ? "Enabled" : "Disabled");
    }
};

export default Menu;