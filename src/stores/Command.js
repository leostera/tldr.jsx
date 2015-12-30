import EventEmitter from 'events';
import assign from 'object-assign';
import co from 'co';
import request from 'axios';
import { decode } from 'base-64';

import Dispatcher from '../dispatchers/Main';
import { ActionTypes } from '../actions/Command';

// Internal data structure for commands
const INDEX_URL = "http://tldr-pages.github.io/assets/index.json";
let _commands = [];
let _currentCommand = {};

let CommandStore = assign( {}, EventEmitter.prototype, {

  emitChange: function () {
    this.emit("change");
  },

  addChangeListener: function(callback) {
    this.on("change", callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener("change", callback);
  },

  getCurrentCommand: function () { return _currentCommand; },

  getCommands: function () { return _commands; }

});

CommandStore.dispatchToken = Dispatcher.register(function (payload) {
  switch(payload.type) {

    case ActionTypes.CMD_SEARCH:
      _currentCommand = _commands.filter( command => {
        return payload.cmd === command.name;
      });
      CommandStore.emitChange();      
    break;

    case ActionTypes.CMD_LOAD_INDEX:
      co(function *getIndex() {
        let requestOptions = {
          method: 'GET',
          url: INDEX_URL,
          withCredentials: false
        };
        let index = yield request(requestOptions);
        return index.data.commands;
      }).then( index => { _commands = index; } );
    break;

    default:
      // no-op
  };
});

export default CommandStore;
