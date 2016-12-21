import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http'


Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'send'(from, to, amount) {
        if(amount <= 0) {
            //TODO error
        }

        data = {
            "jsonrpc": "2.0",
            "method": "invoke",
            "params": {
                "type": 1,
                "chaincodeID":{
                    "name":"SimpleSample"
                },
                "ctorMsg": {
                    "args":["invoke", from, to, amount]
                },
                 "secureContext": "lukas"
            },
            "id": 3
        }

        //console.log("Sending " + from + ' ' + to + ' ' + amount);
        //let result = HTTP.post("http://vp0:7050/chaincode", { "data": data });
        let result = HTTP.post("http://127.0.0.1:7050/chaincode", { "data": data });
        //console.log(result);
        return result; 
    },
    'query'(who) {
        data = {
            "jsonrpc": "2.0",
            "method": "query",
            "params": {
                "type": 1,
                "chaincodeID":{
                    "name":"SimpleSample"
                },
                "ctorMsg": {
                    "args":["query", who]
                }
            },
            "id": 5
        }

        return HTTP.post("http://172.17.0.2:7050/chaincode", { "data": data });
    }
});
