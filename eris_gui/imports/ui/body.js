import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  Meteor.subscribe('chains');
  Meteor.subscribe('eris_nodes');
  Meteor.subscribe('eris_node_types');
});

Template.body.helpers({
  chains() {
      return Chains.find();
  },
  host: location.host
});

Template.node.helpers({
  gui_domain: location.hostname
});

Template.chain.helpers({
  eris_nodes() {
      return ErisNodes.find();
  }})

Template.new_node.helpers({
  eris_node_types() {
      return ErisNodeTypes.find();
  },
});

Template.new_node.events({
  'submit'(event) {
    // Prevent default browser form submit
    //event.preventDefault();

    // Get value from form element
    const target = event.target;
    const name = target.name.value;
    const chain = target.chain.value;
    const coins = target.coins.value;
    
    Meteor.call('eris.chains.new', name, chain, coins)
 
    // Clear form
    //target.text.value = '';
  },
});

Template.new_blockchain.events({
  'submit'(event) {
    // Prevent default browser form submit
    //event.preventDefault();

    // Get value from form element
    const target = event.target;
    const name = target.name.value;

    Meteor.call('eris.chains.make', name)
 
    // Clear form
    //target.text.value = '';
  },
});

Template.chain.events({
  'click .btn'(event) {
    Meteor.call('eris.chains.'+event.target.name, event.target.value);
  },
});

 
Template.registerHelper('isRunning', function(state){
      return state == "Running";
});
