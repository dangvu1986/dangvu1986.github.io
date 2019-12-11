import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import { FormControl, Input, FormHelperText, ListItemIcon, MenuItem } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/Delete';

const GreenCheckbox = withStyles({
    root: {
        color: green[400],
        '&$checked': {
            color: green[600],
        },
    },
    checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export default function CheckboxLabels(prop: any) {
    const [state, setState] = React.useState({
        read: false,
        write: false,
        append: false,
        control: false,
    });

    const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [name]: event.target.checked });
    };

    return (
        
        <TableRow key={prop.misa}>
            <TableCell align="center">
                {prop.misa}
            </TableCell>
            <TableCell align="center">
                <FormControlLabel label="" control={
                    <Checkbox checked={state.read}
                        onChange={handleChange('read')}
                        value="read"
                        color="primary" />
                } />
            </TableCell>
            <TableCell align="center">
                <FormControlLabel label="" control={
                    <Checkbox checked={state.write}
                        onChange={handleChange('write')}
                        value="write"
                        color="primary" />
                } />
            </TableCell>
            <TableCell align="center">
                <FormControlLabel label="" control={
                    <Checkbox checked={state.append}
                        onChange={handleChange('append')}
                        value="append"
                        color="primary" />
                } />
            </TableCell>
            <TableCell align="center">
                <FormControlLabel label="" control={
                    <Checkbox checked={state.control}
                        onChange={handleChange('control')}
                        value="control"
                        color="primary" />
                } />
            </TableCell>
            <TableCell align="center">
                <MenuItem>
                    <ListItemIcon>
                        <DeleteIcon />
                    </ListItemIcon>

                </MenuItem>
            </TableCell>
        </TableRow>

    );
}
