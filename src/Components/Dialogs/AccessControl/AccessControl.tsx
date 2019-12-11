import React, { Component, createRef } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';
import { setFileUploadList, MyDispatch, resetFileUploadList, resetAccessControl, updateAccessControl } from '../../../Actions/Actions';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Item } from '../../../Api/Item';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddBox';
import { FormControlLabel, Checkbox, ListItemIcon, MenuItem, DialogContent, DialogContentText, FormControl, Input } from '@material-ui/core';
import { AclItem } from '../../../Api/AclItem';
import { parseACl } from '../../../Api/aclUtils';

class FormDialog extends Component<AccessControlProps> {
    private textField: React.RefObject<HTMLTextAreaElement> = createRef();
    state = {
        lastBlobUrl: null as string | null,
        content: null as string | null,
        loading: false,
        isLoading: false,
        accessTo: "",
        agent: "",
        read: false,
        write: false,
        append: false,
        control: false,
        group: false,
        aclList: [] as AclItem[]
    };

    componentDidUpdate() {
        if (this.props.blobUrl !== this.state.lastBlobUrl && this.state.aclList.length == 0) {

            this.setState({
                lastBlobUrl: this.props.blobUrl
            });
            this.setState({
                loading: true
            });

            this.props.blobUrl && fetch(this.props.blobUrl).then(r => {
                return r.text();
            }).then(async t => {
                let destFile = this.props.initialHost + '/' + this.props.initialPath.join('/') + '/' + this.props.selectedItems[0].name;
                let aclFile = destFile + '.acl';

                let aclList = parseACl(t, aclFile)
                this.setState({
                    accessTo: destFile,
                    content: t,
                    aclList: aclList
                });

                // console.log(this.state.aclList)
                this.setState({
                    loading: false
                });
            });
        }
    }

    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        const item = this.props.item;
        this.props.handleSubmit(event, {
            itemName: item.name,
            aclList: this.state.aclList
        });

    }

    handleChange = (key: number, mode: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (mode == 'group')
            this.state.aclList[key]._isGroup = event.target.checked;
        if (mode == 'read')
            this.state.aclList[key]._read = event.target.checked;
        if (mode == 'write')
            this.state.aclList[key]._write = event.target.checked;
        if (mode == 'append')
            this.state.aclList[key]._append = event.target.checked;
        if (mode == 'control')
            this.state.aclList[key]._control = event.target.checked;
        this.setState({ ...this.state, [name]: event.target.checked });
    };

    handleTextChange = (key: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.state.aclList[key]._agent = event.target.value;
        this.setState({ ...this.state, [name]: event.target.value });
    };
    handleNewTextChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.state.agent = event.target.value;
        this.setState({ ...this.state, [name]: event.target.value });
    };

    handleDelete = (key: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        this.state.aclList.splice(key, 1);
        this.setState({ ...this.state, [name]: event.button.toString });
    };

    handleNewChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ ...this.state, [name]: event.target.checked });
    };

    handleAdd = () => (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        if (!this.validURL(this.state.agent)) {
            alert("Wrong url format!!!!");
            this.resetState();
            return;
        }
        this.state.aclList.push(new AclItem(this.state.aclList.length,
            this.state.agent,
            this.state.accessTo,
            this.state.read,
            this.state.write,
            this.state.append,
            this.state.control,
            this.state.group));
        this.resetState()
        // this.setState({ ...this.state, [name]: "btn add click" });
    };

    validURL(str: string) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    }

    resetState = () => {
        this.setState({
            agent: "",
            read: false,
            write: false,
            append: false,
            control: false,
            group: false
        });
    }

    handleClose(event: DialogButtonClickEvent) {
        this.state.aclList = [];
        this.props.handleClose(event);
    }


    render() {
        const { open } = this.props;
        return (
            <Dialog open={open} onClose={this.handleClose.bind(this)} aria-labelledby="form-dialog-upload" fullWidth={true} maxWidth={'lg'}>
                <form>
                    <DialogTitle id="form-dialog-upload">
                        Access Control to {this.state.accessTo}
                    </DialogTitle>
                    <DialogContent>
                        <Table>
                            <colgroup>
                                <col />
                                <col style={{ width: '50%', padding: '4px 10px' }} />
                                <col style={{ width: '40%' }} />
                                <col />
                            </colgroup>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">Group</TableCell>
                                    <TableCell padding="none">Agent</TableCell>
                                    <TableCell padding="none">Mode</TableCell>
                                    <TableCell padding="checkbox">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.aclList.map(item => <TableRow key={item._key}>
                                    <TableCell padding="checkbox">
                                        <FormControlLabel label="" control={
                                            <Checkbox checked={item.isGroup}
                                                onChange={this.handleChange(item._key, "group")}
                                                value="group"
                                                color="primary" />
                                        } />
                                    </TableCell>
                                    <TableCell padding="none">
                                        <Input fullWidth={true} value={item.agent} onChange={this.handleTextChange(item._key)} placeholder="Input agent webID" />
                                    </TableCell>
                                    <TableCell padding="none">
                                        <FormControlLabel label="Read" control={
                                            <Checkbox checked={item.read}
                                                onChange={this.handleChange(item._key, "read")}
                                                value="read"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Write" control={
                                            <Checkbox checked={item.write}
                                                onChange={this.handleChange(item._key, 'write')}
                                                value="write"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Append" control={
                                            <Checkbox checked={item.append}
                                                onChange={this.handleChange(item._key, 'append')}
                                                value="append"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Control" control={
                                            <Checkbox checked={item.control}
                                                onChange={this.handleChange(item._key, 'control')}
                                                value="control"
                                                color="primary" />
                                        } />
                                    </TableCell>
                                    <TableCell padding="checkbox">
                                        <MenuItem onClick={this.handleDelete(item._key)}>
                                            <ListItemIcon>
                                                <DeleteIcon />
                                            </ListItemIcon>
                                        </MenuItem>
                                    </TableCell>
                                </TableRow>)}
                                <TableRow key={this.state.aclList.length}>
                                    <TableCell padding="checkbox">
                                        <FormControlLabel label="" control={
                                            <Checkbox checked={this.state.group}
                                                onChange={this.handleNewChange("group")}
                                                value="group"
                                                color="primary" />
                                        } />
                                    </TableCell>
                                    <TableCell padding="none">
                                        <Input fullWidth={true} value={this.state.agent} onChange={this.handleNewTextChange()} id="newagent" placeholder="Input agent webID" />
                                    </TableCell>
                                    <TableCell padding='none'>
                                        <FormControlLabel label="Read" control={
                                            <Checkbox checked={this.state.read}
                                                onChange={this.handleNewChange("read")}
                                                value="read"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Write" control={
                                            <Checkbox checked={this.state.write}
                                                onChange={this.handleNewChange("write")}
                                                value="write"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Append" control={
                                            <Checkbox checked={this.state.append}
                                                onChange={this.handleNewChange("append")}
                                                value="append"
                                                color="primary" />
                                        } />
                                        <FormControlLabel label="Control" control={
                                            <Checkbox checked={this.state.control}
                                                onChange={this.handleNewChange("control")}
                                                value="control"
                                                color="primary" />
                                        } />
                                    </TableCell>
                                    <TableCell padding="checkbox">
                                        <MenuItem onClick={this.handleAdd()}>
                                            <ListItemIcon>
                                                <AddIcon />
                                            </ListItemIcon>
                                        </MenuItem>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} color="primary" type="button">
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleSave.bind(this)} type="submit">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

interface StateProps extends DialogStateProps {
    item: Item;
    blobUrl: string;
    initialHost: string;
    initialPath: string[];
    selectedItems: Item[];
}
interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { itemName, aclList }:
        { itemName: string, aclList: AclItem[] }): void;
}
interface AccessControlProps extends StateProps, DispatchProps { }


const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.ACCESS_CONTROL, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        item: state.items.selected[0],
        blobUrl: state.blob || '',
        initialHost: state.account.host || '',
        initialPath: state.path,
        selectedItems: state.items.selected,
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        handleClose: (event) => {
            dispatch(resetAccessControl());
        },
        handleSubmit: (event, { itemName, aclList }) => {
            event.preventDefault();
            dispatch(updateAccessControl(itemName, aclList));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
