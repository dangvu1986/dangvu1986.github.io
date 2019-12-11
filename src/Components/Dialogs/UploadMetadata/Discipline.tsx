import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export default function CheckboxLabels() {
  const [state, setState] = React.useState({
    checkedA: false,
    checkedB: false,
    checkedC: false,
    checkedD: false,
    checkedE: false,
    checkedF: false,
    checkedG: false,
  });

  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [name]: event.target.checked });
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedA}
            onChange={handleChange('checkedA')}
            value="checkedA"
            color="primary"
          />
        }
        label="Mathematics"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedB}
            onChange={handleChange('checkedB')}
            value="checkedB"
            color="primary"
          />
        }
        label="Computer Science"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedC}
            onChange={handleChange('checkedC')}
            value="checkedC"
            color="primary"
          />
        }
        label="Web engineering"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedD}
            onChange={handleChange('checkedD')}
            value="checkedD"
            color="primary"
          />
        }
        label="Physics"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedE}
            onChange={handleChange('checkedE')}
            value="checkedE"
            color="primary"
          />
        }
        label="Chemistry"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedG}
            onChange={handleChange('checkedG')}
            value="checkedG"
            color="primary"
          />
        }
        label="Biology"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedF}
            onChange={handleChange('checkedF')}
            value="checkedF"
            color="primary"
          />
        }
        label="Machine learning"
      />
     
    </FormGroup>
  );
}
