import {
    Tools
} from '../apis';
import {
    ToolInterface
} from '../types';

export default class Tool {
    private tools: Tools;
    public props: ToolInterface;

    constructor(tools: Tools, tool: ToolInterface) {
        this.props = tool;
        this.tools = tools;
    }
}
