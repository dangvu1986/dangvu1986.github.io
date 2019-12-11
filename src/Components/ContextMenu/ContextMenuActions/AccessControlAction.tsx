import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CloudUploadIcon from '@material-ui/icons/Settings';
import { openDialog, MyDispatch, loadAndOpenAccessControl } from '../../../Actions/Actions';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';

function AccessControlAction(props: AccessControlActionProps) {

    const { handleClick, selectedItems } = props;

    return (
        <MenuItem onClick={() => handleClick(selectedItems)}>
            <ListItemIcon>
                <CloudUploadIcon />
            </ListItemIcon>
            <Typography variant="inherit">
                Access Control
            </Typography>
        </MenuItem>        
    );
}

interface AccessControlActionProps {
    handleClick(selectedItems: Item[]): void;
    selectedItems: Item[];
}

const mapStateToProps = (state: AppState) => {
    return {selectedItems: state.items.selected};
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: (selectedItems: Item[]) => {
            dispatch(loadAndOpenAccessControl(selectedItems[0].name));
        }
        // handleClick: () => {
        //     dispatch(openDialog(DIALOGS.ACCESS_CONTROL));
        // }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccessControlAction);
