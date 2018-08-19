import React, { Component } from 'react';
import './App.css';
import moment from 'moment';
import lodash from 'lodash';

import Expenses from './data/expenseTypes.json';

// Material
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


var firebase = require("firebase/app");

// Add additional services that you want to use
require("firebase/database");

var config = {
  apiKey: "AIzaSyB7dQtIY2-0ZWtAfgFEScb1--h7Qv8-_aw",
  authDomain: "finance-cae07.firebaseapp.com",
  databaseURL: "https://finance-cae07.firebaseio.com",
  projectId: "finance-cae07",
  storageBucket: "finance-cae07.appspot.com",
  messagingSenderId: "1026547149134"  
};

firebase.initializeApp(config);

const expenseTypesFB = firebase.database().ref().child('expenseTypes');
const expensesFB = firebase.database().ref().child('expenses');

expenseTypesFB.on('value', snap => {
  // console.log(snap.val());
});


const marginTop = {
  marginTop: '20px'
}
const marginBottom = {
  marginBottom: '40px'
}
const alignLeft = {
  textAlign: 'left'
}

const expenseTypesEnum = [
  'daily',
  'miscellaneous',
  'cyclic'
]

class App extends Component {
  state = {
    value: 0,
    chosenExpenseCategory: 0,
    expenseType: '',
    expenseAmount: '',
    expenses: []
  };

  handleMainTabChange = (event, value) => {
    this.setState({ value });
  };
  
  handleExpenseCategoryChange = (event, chosenExpenseCategory) => {
    this.setState({ chosenExpenseCategory });
  };

  handleSelectChange = name => event => {
    this.setState({
      'expenseType': event.target.value
    });
  };

  handleAmountChange = (event) => {
    this.setState({
      'expenseAmount': event.target.value
    });
  };

  handleSubmit() {
    if (this.state.expenseType === '' && this.state.expenseAmount === 0) {
      console.log('missing fields')
      return;
    }
    const postData = {
      expenseType: this.state.expenseType,
      expenseAmount: this.state.expenseAmount,
      date: moment().format('L')
    };

    const newExpenseKey = firebase.database().ref().child('posts').push().key;

    let updates = {};
    updates['/expenses/' + newExpenseKey] = postData;
    
    this.setState({
      expenseType: '',
      expenseAmount: ''
    })

    return firebase.database().ref().update({
      ...updates
    }, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log('success')
      }
    }
    );
  };

  componentDidMount() {
    let currentLabel = '';

    expensesFB.on('child_added', data => {

      for (let i = 0; i < Expenses.length; i++) {
        if (Expenses[i].value === data.val().expenseType) {
          currentLabel = Expenses[i].label
        }
      }

      this.setState({
        expenses: [
          {
            category: data.val().expenseType,
            amount: data.val().expenseAmount,
            date: data.val().date,
            label: currentLabel
          },
          ...this.state.expenses,
        ]        
      })
    });
  }

  componentDidUpdate() {
    console.log('expenses list', this.state.expenses);
  }

  render() {
    const { value, chosenExpenseCategory } = this.state;
    const expenses = Expenses;

    return (
      <div className="App">
        <AppBar position="static" color="default">
          <Tabs
            value={chosenExpenseCategory}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
            onChange={this.handleExpenseCategoryChange}
            >
            <Tab label="Codzienne" />
            <Tab label="Losowe" />
            <Tab label="Cykliczne" />
          </Tabs>
        </AppBar>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={16} >
          <Grid item xs={11}>
            <form noValidate autoComplete="off">
            <Grid item xs={11} style={marginTop}>
              <TextField 
                style={alignLeft}
                fullWidth
                id="expenseType"
                select
                required
                label="Wydatek"
                value={this.state.expenseType}
                onChange={this.handleSelectChange('expense')}
                margin="normal">
                  {expenses.map(option => (
                      option.category === expenseTypesEnum[chosenExpenseCategory] &&
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={11} style={marginBottom}>
              <TextField
                id="amount"
                fullWidth
                label="Kwota"
                margin="normal"
                value={this.state.expenseAmount}
                required
                onChange={this.handleAmountChange}
                type="number">
              </TextField>
            </Grid>
            <Grid item xs={11} style={marginTop}>
              <Button variant="fab" color="secondary" aria-label="Add" onClick={this.handleSubmit.bind(this)}>
                <AddIcon />
              </Button>
            </Grid>
            <Grid item xs={11} style={marginTop}>
            <List dense>
              {this.state.expenses.map((expense, index) => (
                <ListItem key={`item-${index}`}>
                  <ListItemText primary={`${expense.label} ${expense.amount} zł`} secondary={`${expense.date}`} />
                </ListItem>
              ))}
            </List>
            </Grid>
            </form>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
