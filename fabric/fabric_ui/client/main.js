import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-dict';

import './main.html';

Template.body.onCreated(function bodyOnCreated() {
  this.txdata = new ReactiveDict();
});

Template.body.helpers({
  get_txid() {
    return Template.instance().txdata.get("txid");
  },
  get_from() {
    return Template.instance().txdata.get("from");
  },
  get_to() {
    return Template.instance().txdata.get("to");
  },
  get_amount() {
    return Template.instance().txdata.get("amount");
  },
});

Template.sendform.events({
  'submit .send'(event, instance) {
    event.preventDefault();

    const target = event.target;

    const from = target.from.value;
    const to = target.to.value;
    const amount = target.amount.value;

    //target.from.value = '';
    //target.to.value = '';
    //target.amount.value = '';

    console.log("Sending " + from + ' ' + to + ' ' + amount);
    Meteor.call('send', from, to, amount, function(error, result) {
        if(error) {
            alert(error);
            return;
        }
        console.log(result);
        let txid = result["data"]["result"]["message"];
        console.log(txid);
        instance.txdata.set("txid", txid);
        instance.txdata.set("from", from);
        instance.txdata.set("to", to);
        instance.txdata.set("amount", amount);
    });
  },
});
