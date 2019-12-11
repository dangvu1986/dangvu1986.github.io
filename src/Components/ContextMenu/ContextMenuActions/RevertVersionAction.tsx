import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import { openDialog, MyDispatch } from '../../../Actions/Actions';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';

function RevertVersionAction(props: RevertVersionActionProps) {
    const { handleClick } = props;

    return (
        <MenuItem onClick={() => handleClick()}>
            <ListItemIcon>
                <SettingsBackupRestore />
            </ListItemIcon>
            <Typography variant="inherit">
                Revert Version
            </Typography>
        </MenuItem>        
    );
}

interface RevertVersionActionProps {
    handleClick(): void;
}

const mapStateToProps = (state: AppState) => {
    return {};
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: () => {
            alert("Revert file!");
            //dispatch(alert("Revert file!"));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RevertVersionAction);
