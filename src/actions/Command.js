import Dispatcher from '../dispatchers/Main';

const ActionTypes = {
  CMD_SEARCH: Symbol("CMD_SEARCH"),
};

let Command = {

  search: (cmd) => {
    Dispatcher.dispatch({
      type: ActionTypes.CMD_SEARCH,
      cmd: cmd
    });
  }

};

export { ActionTypes, Command };
