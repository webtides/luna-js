import { render } from '../../renderer'
import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'TemplateRenderer'
})
class TemplateRenderer {
    renderToString(template) {
        return render(template);
    }
}

export default TemplateRenderer;
