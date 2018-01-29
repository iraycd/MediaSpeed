import React from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom'
import {toggleMenu} from '../actions/mainMenuActions';
import MainContent from "../components/MainContent/MainContent";


class MainMenuContainer  extends React.Component {

    render() {
        return <MainContent mainMenuVisible={this.props.mainMenuVisible}/>
    }
}

function mapStateToProps (state) {
    return {
        selectedMenuItem: state.mainMenu.selectedItem,
        mainMenuVisible: state.mainMenu.visible,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        toggleMenu: () => dispatch(toggleMenu())
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(MainMenuContainer))
