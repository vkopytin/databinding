/** @jsx el */
import { el } from '../virtualDom';
import { connect } from '../connect';
import { SubView } from './subView';


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

export const MainView = connect(mapStateToProps, mapDispatchToProps)(({ dispatch, ...props } = {} as any) =>
    <div className='test' style={'border: 1px solid ' + (props.value % 2 ? 'green' : 'blue') + ';padding: 3px;' as any}>
    <div>{'' + props.value}</div>
        <input type='text' value={props.value}/>
        <button onClick={(evnt) => dispatch({ type: 'update', payload: props.value + 1 })}>Update</button>
    <div style={'border: 1px solid grey; padding: 4px;' as any }>
            <input type='text' value={props.itemName} onInput={(evnt) => dispatch({ type: 'itemName', payload: evnt.target['value'] }) }/>
        <button onClick={(evnt) => dispatch({ type: 'createItem', payload: props.itemName }) }>Add</button>
        <SubView/>
    </div>
</div>);
