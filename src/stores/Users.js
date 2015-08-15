import EventEmitter from 'events';
import assign from 'object-assign';

import Dispatcher from '../dispatchers/Main';
import { ActionTypes } from '../actions/Users';

// Internal data structure for users
let _users = [{
  name: "ostera",
  email: "leandro@ostera.io"
}];

let UserStore = assign( {}, EventEmitter.prototype, {

  emitChange: function () {
    this.emit("change");
  },

  addChangeListener: function(callback) {
    this.on("change", callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener("change", callback);
  },

  find: function (username) {
    return _users.filter(function (user) {
      return user.name === username;
    });
  },

  all: function () { return _users; }

});

UserStore.dispatchToken = Dispatcher.register(function (action) {
  switch(action.type) {

    case ActionTypes.USER_SEARCH:
      UserStore.emitChange();      
    break;

    default:
      // no-op
  };
});

export default UserStore;
