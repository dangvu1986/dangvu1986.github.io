import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from 'react-redux';
import { resetFileUploader, uploadMetadata, setFileUploadList, MyDispatch, resetFileUploadList, setErrorMessage, resetMetadataUploader, createMetadataACL } from '../../../Actions/Actions';
import FileUploader from '../../FileUploader/FileUploader';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { withStyles, Tabs, Tab, Typography, FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';

import SimpleListMenu from './Discipline';
import { Item } from '../../../Api/Item';



class FormDialog extends Component<UploadFileProps> {

    state = {
        activeIndex: 0,
        // inputVal: props.inputValue
    }
    updateInput = (val: any) => this.setState({ inputVal: val })


    handleChange = (_: any, activeIndex: any) => this.setState({ activeIndex })

    handleSubmit(event: DialogButtonClickEvent) {
        const item = this.props.item;
        if (item) {
            this.props.handleSubmit(event, { item });
        }
    }
    
    render() {
        const { handleClose, handleReset, open, canUpload, progress, fileList, handleSelectedFiles } = this.props;
        let activeIndex = this.state.activeIndex;

        return (
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-upload" fullWidth={true} maxWidth={'sm'}>
                <div>
                    <VerticalTabs
                        value={activeIndex}
                        onChange={this.handleChange}
                    >

                        <MyTab label='Upload metadata file' />
                        <MyTab label='Input metadata annotation' />
                    </VerticalTabs>
                    {activeIndex === 0 && <form>
                        <DialogContent>
                            <FileUploader fileList={fileList} handleSelectedFiles={handleSelectedFiles} handleReset={handleReset} />
                            {canUpload ? <LinearProgress variant="determinate" value={progress} /> : null}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" type="button">
                                Cancel
                        </Button>
                            <Button color="primary" onClick={this.handleSubmit.bind(this)}disabled={!canUpload} type="submit">
                                Upload
                        </Button>
                        </DialogActions>
                    </form>}
                    {activeIndex === 1 && <form>
                        <DialogContent>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="my-input">Title</InputLabel>
                                <Input id="my-input" aria-describedby="my-helper-text" />
                            </FormControl>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="my-input">Author</InputLabel>
                                <Input id="my-input" aria-describedby="my-helper-text" />
                            </FormControl>
                            <FormControl fullWidth={true} >
                                <InputLabel htmlFor="my-input">Description</InputLabel>
                                <Input id="my-input" aria-describedby="my-helper-text" />
                            </FormControl>
                            <FormControl fullWidth={true} >
                                <InputLabel htmlFor="my-input">Version</InputLabel>
                                <Input id="my-input" aria-describedby="my-helper-text" />
                            </FormControl>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="my-input">Keyword</InputLabel>
                                <Input id="my-input" aria-describedby="my-helper-text" />
                            </FormControl>
                            <FormControl fullWidth={true}>
                                <SimpleListMenu />
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" type="button">
                                Cancel
                        </Button>
                            <Button color="primary" onClick={this.handleSubmit.bind(this)} disabled={!canUpload} type="submit">
                                Submit
                        </Button>
                        </DialogActions>
                    </form>}
                </div>

            </Dialog>
        );
    }
}

const VerticalTabs = withStyles(theme => ({
    flexContainer: {
        flexDirection: 'row'
    },
    indicator: {
        display: 'none',
    }
}))(Tabs)

const MyTab = withStyles(theme => ({
    selected: {
        color: 'tomato',
        borderBottom: '2px solid tomato'
    }
}))(Tab);

function TabContainer(props: { children: React.ReactNode; }) {
    return (
        <Typography component="div" style={{ padding: 24 }}>
            {props.children}
        </Typography>
    );
}

interface StateProps extends DialogStateProps {
    item?: Item;
    canUpload: boolean;
    fileList: FileList | null;
    progress: number;
}
interface DispatchProps extends DialogDispatchProps {
    handleSelectedFiles(event: React.ChangeEvent<HTMLInputElement>): void;
    handleReset(): void;
    handleSubmit(event: DialogButtonClickEvent, { item }: { item: Item }): void;
    
}
interface UploadFileProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        item: state.items.selected[0],
        open: state.visibleDialogs.UPLOAD_METADATA,
        canUpload: state.upload.fileList ? state.upload.fileList.length > 0 : false,
        fileList: state.upload.fileList,
        progress: state.upload.progress,
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        handleClose: (event) => {
            dispatch(resetMetadataUploader());
        },
        handleSubmit: (event, { item} ) => {
            event.preventDefault();
            dispatch(uploadMetadata(item));
        },
        handleSelectedFiles: (event) => {
            const files = event.target.files;
            dispatch(setFileUploadList(files));
        },
        handleReset: () => {
            dispatch(resetFileUploadList());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
