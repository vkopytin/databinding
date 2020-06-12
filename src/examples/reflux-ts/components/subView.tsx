/** @jsx el */
import { el } from '../virtualDom';
import { connect } from '../connect';


function mapStateToProps(state, props) {
    const newState = {
        ...props,
        ...state
    };
    return newState;
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch
    };
}

export const SubView = connect(mapStateToProps, mapDispatchToProps)(({ items = [] }) => <ul>
    {items.map(item => el('li', {}, '' + item))}
</ul>);
