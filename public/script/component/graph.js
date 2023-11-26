import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import ForceGraph3D from '3d-force-graph';

@Component
class Graph extends H12.Component {
    constructor() {
        super();
        this.Graph = null;
    }
    async init() {

        Dispatcher.On("InterfaceDisable", this.Disable.bind(this));
        Dispatcher.On("InterfaceEnable", this.Enable.bind(this));

        Dispatcher.On("LoadGraph", this.Load.bind(this));
        Dispatcher.On("CreateNode", ({ detail }) => { this.CreateNode(detail); });
        
    }
    async render() {

        return <>
            <div class="bg-gray-900 w-full relative overflow-hidden" id="graphholder">
                <div class="bg-gray-900 opacity-50 absolute w-full h-full z-10 hidden" id="graphpanel"></div>
                <div id="graph"></div>
            </div>
        </>;

    }
    
    Disable() {
        this.element.graphpanel.classList.remove("hidden");
    }
    Enable() {
        this.element.graphpanel.classList.add("hidden");
    }

    async Load() {

        //Call dispatcher to disable input
        Dispatcher.Call("InterfaceDisable");

        //Get graph data
        const _response = await fetch("http://localhost:3000/api/node/fetch");
        const _data = await _response.json();

        //Call counter
        Dispatcher.Call("SetNodeCount");

        //On error
        if(!_data.success) {

            alert("Unable to load data");
            
            //Call dispatcher enable input
            Dispatcher.Call("InterfaceEnable");
            return false;

        };

        //Call dispatcher enable input
        Dispatcher.Call("InterfaceEnable");

        //Check if graph exists
        if(this.Graph == null) {

            //Get panel width and height
            const _width = this.root.offsetWidth;
            const _height = this.root.offsetHeight;

            //Create new graph
            this.Graph = ForceGraph3D()(this.element.graph)
            .width(_width)
            .height(_height)
            .graphData(_data.data)
            .enableNodeDrag(false)
            .nodeAutoColorBy('group')
            .linkAutoColorBy(d => (Math.floor(Math.random() * 100)))
            .linkDirectionalParticles("value")
            .linkDirectionalParticleSpeed(d => d.value * 0.001)
            .onNodeHover(node => {
                
                Dispatcher.Call("SetNodeInformation", (node !== null) ? node.id : "No node hovered")
    
            })
            .onNodeClick((node) => {
                
                this.LoadNode(node)
            
            });
        }
        else {
            this.Graph.graphData(_data.data);
        };

    }

    async CreateNode(value = "", node = null) {

        //Call dispatcher to disable input
        Dispatcher.Call("InterfaceDisable");

        //Get new node url and check if valid
        if(value.length > 0) {

            //Create new node
            let _response = await fetch(`http://localhost:3000/api/node/create?url=${value}`);
            let _data = await _response.json();
    
            //Check if success
            if(_data.success) {

                //If node is not null and auto genereate is enabled then try to load new node
                if(node == null && !this.parent.AutoGenerateEnabled) {
                    alert("Node created, please click refresh or click that node again to see changes");
                }
                else {
                    this.LoadNode(node);
                };

                //Call counter
                Dispatcher.Call("SetNodeCount");

            }
            else {
                alert(_data.message);
            };
        }
        else {
            alert("Please enter url");
        };

        //Call dispatcher enable input
        Dispatcher.Call("InterfaceEnable");

    }

    async LoadNode(node = null) {

        //Check if node is valid
        if(node == null) {
            return false;
        };

        //Call dispatcher to disable input
        Dispatcher.Call("InterfaceDisable");

        //Get graph data
        let _response = await fetch(`http://localhost:3000/api/node/fetch?url=${node.id}`);
        let _data = await _response.json();

        //Check if respond data is valid
        if(_data.success && _data.data.nodes.length > 0) {

            //Get old node and links from graph
            const { nodes, links } = this.Graph.graphData();

            //Merge nodes and remove duplicated
            const _node = nodes.concat(_data.data.nodes);
            const _uniquenode = _node.reduce((unique, o) => {
                if(!unique.some(obj => obj.id === o.id)) {
                    unique.push(o);
                }
                return unique;
            },[]);

            //Merge links and remove duplicated
            const _link = links.concat(_data.data.links);
            const _uniquelink = _link.reduce((unique, o) => {
                if(!unique.some(obj => obj.source === o.source && obj.target === o.target)) {
                    unique.push(o);
                }
                return unique;
            },[]);

            //Add new data to the graph
            this.Graph.graphData({
                nodes: _uniquenode,
                links: _uniquelink
            });

        }
        else {

            //If there is a node then try to generate new child nodes
            if(node.id.length > 0) {

                //Set new node url
                Dispatcher.Call("SetNodeURL", node.id);

                //Check if auto load is enabled
                if(this.parent.AutoGenerateEnabled) {
                    await this.CreateNode(node.id, node);
                }
                else {
                    alert(`No child node found for: ${node.id}`);
                };

            };

        };

        //Call dispatcher enable input
        Dispatcher.Call("InterfaceEnable");

    }

};

export default Graph;