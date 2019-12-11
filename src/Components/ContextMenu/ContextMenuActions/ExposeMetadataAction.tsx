import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { openDialog, MyDispatch, loadExposeMetadata } from '../../../Actions/Actions';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';

function ExposeMetadataAction(props: ExposeMetadataActionProps) {
    const { handleClick, selectedItems } = props;
    return (
        <MenuItem onClick={() => handleClick(selectedItems)}>
            <ListItemIcon>
                <HowToVoteIcon />
            </ListItemIcon>
            <Typography variant="inherit">
                Expose Metadata
            </Typography>
        </MenuItem>        
    );
}

interface ExposeMetadataActionProps {
    handleClick(selectedItems: Item[]): void;
    selectedItems: Item[];
}

const mapStateToProps = (state: AppState) => {
    return {
        selectedItems: state.items.selected};
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: (selectedItems: Item[]) => {
            dispatch(loadExposeMetadata(selectedItems[0].name));
            // dispatch(openDialog(DIALOGS.EXPOSE_METADATA));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExposeMetadataAction);
