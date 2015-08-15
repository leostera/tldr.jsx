import Dispatcher from '../dispatchers/Main';

const ActionTypes = {
  CMD_SEARCH: Symbol("CMD_SEARCH"),
  CMD_LOAD_INDEX: Symbol("CMD_LOAD_INDEX"),
};

let Command = {

  search: (cmd) => {
    Dispatcher.dispatch({
      type: ActionTypes.CMD_SEARCH,
      cmd: cmd
    });
  },

  loadIndex: () => {
    Dispatcher.dispatch({
      type: ActionTypes.CMD_LOAD_INDEX
    });
  }

};

export { ActionTypes, Command };
