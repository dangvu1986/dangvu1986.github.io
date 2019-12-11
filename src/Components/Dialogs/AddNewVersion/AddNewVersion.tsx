import React, { Component, createRef } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from 'react-redux';
import { resetFileUploader, uploadFiles, setFileUploadList, MyDispatch, resetFileUploadList, setErrorMessage, uploadReseachData, resetNewVersionUploader, handleAddNewVersion } from '../../../Actions/Actions';
import FileUploader from '../../FileUploader/FileUploader';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { withStyles, Tabs, Tab, Typography, FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';
import { Item } from '../../../Api/Item';
import { getVersion } from '../../../Api/aclUtils';
import { version } from 'punycode';

class FormDialog extends Component<AddNewVersionProp> {
    state = {
        lastBlobUrl: null as string | null,
        currentVersion: "1.0",
        nextVersion: ""
    }
    handleSubmit(event: DialogButtonClickEvent) {
        const item = this.props.item;
        const currentVersion = this.state.currentVersion;
        const nextVersion = this.state.nextVersion;
        if (item) {
            this.props.handleSubmit(event, { item, currentVersion, nextVersion });
        }
    }

    componentDidUpdate() {
        if (this.props.blobUrl !== this.state.lastBlobUrl) {
            this.setState({
                lastBlobUrl: this.props.blobUrl
            });
            this.setState({
                loading: true
            });

            this.props.blobUrl && fetch(this.props.blobUrl).then(r => {
                return r.text();
            }).then(async t => {
                let subj = this.props.initialHost + '/' + this.props.initialPath.join('/') + '/' + this.props.selectedItems[0].name + '.ttl';
                let version = getVersion(t, subj)
                this.setState({
                    currentVersion: version,
                    content: t
                });

                // console.log(this.state.aclList)
                this.setState({
                    loading: false
                });
            });
        }
    }

    handleTextChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.state.nextVersion = event.target.value;
        this.setState({ ...this.state, [name]: event.target.value });
    };

    render() {
        const { handleClose, handleReset, open, canUpload, progress, fileList, handleSelectedFiles } = this.props;

        return (
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-upload" fullWidth={true} maxWidth={'sm'}>
                <form>
                    <DialogTitle id="form-dialog-upload">
                        Add New Version
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="oldversion">Current Version</InputLabel>
                            <Input id="oldversion" aria-describedby="my-helper-text" value={this.state.currentVersion} disabled />
                        </FormControl>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="newversion">New version</InputLabel>
                            <Input fullWidth={true} onChange={this.handleTextChange()} id="newversion" placeholder="Enter new version" />
                        </FormControl>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="newversion">Message</InputLabel>
                            <Input fullWidth={true} id="message" placeholder="Enter your message" />
                        </FormControl>
                        <FormControl fullWidth={true}>
                            <FileUploader fileList={fileList} handleSelectedFiles={handleSelectedFiles} handleReset={handleReset} />
                            {canUpload ? <LinearProgress variant="determinate" value={progress} /> : null}
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" type="button">
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleSubmit.bind(this)} disabled={!canUpload} type="submit">
                            Upload
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

interface StateProps extends DialogStateProps {
    canUpload: boolean;
    fileList: FileList | null;
    progress: number;
    item?: Item;
    blobUrl: string;
    initialHost: string;
    initialPath: string[];
    selectedItems: Item[];
}
interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { item }: { item: Item, currentVersion: string, nextVersion: string }): void;
    handleSelectedFiles(event: React.ChangeEvent<HTMLInputElement>): void;
    handleReset(): void;
}
interface AddNewVersionProp extends StateProps, DispatchProps { }


const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.ADD_NEW_VERSION,
        item: state.items.selected[0],
        canUpload: state.upload.fileList ? state.upload.fileList.length > 0 : false,
        fileList: state.upload.fileList,
        progress: state.upload.progress,
        blobUrl: state.blob || '',
        initialHost: state.account.host || '',
        initialPath: state.path,
        selectedItems: state.items.selected
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {

        handleClose: (event) => {
            dispatch(resetNewVersionUploader());
        },
        handleSubmit: (event, { item, currentVersion, nextVersion }) => {
            event.preventDefault();
            dispatch(handleAddNewVersion(item, currentVersion, nextVersion));
        },
        handleSelectedFiles: (event) => {
            const files = event.target.files;
            dispatch(setFileUploadList(files));
        },
        handleReset: () => {
            // dispatch(resetFileUploadList());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
