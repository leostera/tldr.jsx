import Dispatcher from '../dispatchers/Main';

const ActionTypes = {
  PAGE_LOAD: Symbol("PAGE_LOAD"),
};

let Page = {

  load: (cmd) => {
    Dispatcher.dispatch({
      type: ActionTypes.PAGE_LOAD,
      cmd
    });
  }

};

export { ActionTypes, Page };
