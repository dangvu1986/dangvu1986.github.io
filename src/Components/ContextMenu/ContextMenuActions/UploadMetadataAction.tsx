import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { openDialog, MyDispatch } from '../../../Actions/Actions';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';

function UploadMetadataAction(props: UploadMetadataActionProps) {
    const { handleClick } = props;

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <CloudUploadIcon />
            </ListItemIcon>
            <Typography variant="inherit">
                Upload Metadata
            </Typography>
        </MenuItem>        
    );
}

interface UploadMetadataActionProps {
    handleClick(): void;
}

const mapStateToProps = (state: AppState) => {
    return {};
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: () => {
            dispatch(openDialog(DIALOGS.UPLOAD_METADATA));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadMetadataAction);
