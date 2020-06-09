import { Base } from '../base/base';


class MainViewModel extends Base<MainViewModel['state']> {
    state = {
        html: localStorage.getItem('html')
    };
    constructor() {
        super();
    }
    saveCommand() {
        localStorage.setItem('html', this.state.html);
    }
}

export { MainViewModel };
