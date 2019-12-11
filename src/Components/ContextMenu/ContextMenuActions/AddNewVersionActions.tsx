import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { openDialog, MyDispatch, loadMetadataFile } from '../../../Actions/Actions';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';

function AddNewVersionAction(props: AddNewVersionActionProps) {
    const { handleClick, selectedItems } = props;

    const handleCloseAfter = (callback: () => void) => () => {
        callback();
    };

    return (
        <MenuItem onClick={() => handleClick(selectedItems)}>
            <ListItemIcon>
                <CloudUploadIcon />
            </ListItemIcon>
            <Typography variant="inherit">
                Add new Version
            </Typography>
        </MenuItem>
    );
}

interface AddNewVersionActionProps {
    handleClick(selectedItems: Item[]): void;
    selectedItems: Item[];
    // handleClose(): void;
}

const mapStateToProps = (state: AppState) => {
    return {
        selectedItems: state.items.selected
    };
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: (selectedItems: Item[]) => {
            dispatch(loadMetadataFile(selectedItems[0].name));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNewVersionAction);
