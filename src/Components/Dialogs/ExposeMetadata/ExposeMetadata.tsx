import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DialogStateProps, DialogButtonClickEvent, DialogDispatchProps } from '../dialogTypes';
import { Item } from '../../../Api/Item';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button, Input, FormControl, InputLabel } from '@material-ui/core';
import { MyDispatch, closeDialog, handleExposeData } from '../../../Actions/Actions';
import { getContent } from '../../../Api/aclUtils';

class ExposeMetadata extends Component<ExposeMetadataProps> {
    state = {
        lastBlobUrl: null as string | null,
        currentVersion: "1.0",
        metadatainfo: { keyword:"", discipline: "" },
        name: this.props.selectedItems[0] ? this.props.selectedItems[0].name : ''
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
                let subj = this.props.initialHost + '/' + this.props.initialPath.join('/') + '/' + this.props.selectedItems[0].name;
                let content = getContent(t, subj)
                this.setState({
                    name :subj,
                    metadatainfo: content,
                    content: t
                });

                // console.log(this.state.aclList)
                this.setState({
                    loading: false
                });
            });
        }
    }

    handleTextChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (key == "keyword")
            this.state.metadatainfo.keyword = event.target.value;
        if (key == "discipline")
            this.state.metadatainfo.discipline = event.target.value;
        this.setState({ ...this.state, [name]: event.target.value });
    };

    handleSubmit(event: DialogButtonClickEvent) {
        const item = this.props.item;
        const metadatainfo = this.state.metadatainfo;
        if (item) {
            this.props.handleSubmit(event, { item, metadatainfo });
        }
    }

    render() {
        const { handleClose, open, initialHost, initialPath } = this.props;
        return (
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-upload" fullWidth={true} maxWidth={'sm'}>
                <form>
                    <DialogTitle id="form-dialog-upload">
                        Expose Metadata
                </DialogTitle>
                    <DialogContent>
                        {this.state.name}
                        <FormControl fullWidth={true} >
                            <InputLabel htmlFor="my-input">Keyword</InputLabel>
                            <Input value={this.state.metadatainfo.keyword} onChange={this.handleTextChange("keyword")} id="keyword" aria-describedby="my-helper-text" />
                        </FormControl>
                        <FormControl fullWidth={true} >
                            <InputLabel htmlFor="my-input">Discipline</InputLabel>
                            <Input value={this.state.metadatainfo.discipline} disabled onChange={this.handleTextChange("discipline")} id="discipline" aria-describedby="my-helper-text" />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" type="button">
                            Close
                    </Button>
                        <Button color="primary" onClick={this.handleSubmit.bind(this)} type="submit">
                            Expose
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}

interface StateProps extends DialogStateProps {
    initialHost: string;
    initialPath: string[];
    blobUrl: string;
    item?: Item;
    selectedItems: Item[];
}
interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { item }:
        { item: Item, metadatainfo: {keyword:string, discipline:string} }): void;
    handleSelectedFiles(event: React.ChangeEvent<HTMLInputElement>): void;
    handleReset(): void;
}
interface ExposeMetadataProps extends StateProps, DispatchProps { }



const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EXPOSE_METADATA,
        blobUrl: state.blob || '',
        item: state.items.selected[0],
        initialHost: state.account.host || '',
        initialPath: state.path,
        selectedItems: state.items.selected,
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {

    return {

        handleClose: (event) => {
            dispatch(closeDialog(DIALOGS.EXPOSE_METADATA));
        },
        handleSubmit: (event, { item, metadatainfo }) => {
            event.preventDefault();
            dispatch(handleExposeData(item, metadatainfo));
        },
        handleSelectedFiles: (event) => {
            const files = event.target.files;
            // dispatch(setFileUploadList(files));
        },
        handleReset: () => {
            // dispatch(resetFileUploadList());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExposeMetadata);