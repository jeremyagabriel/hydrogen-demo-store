import {useMemo, useReducer} from 'react';
import type {ReactNode} from 'react';

import type {Action, Dispatch, MenuState} from '~/lib/types';

import {Context} from './useMenuContext';

const defaultModal = {children: null, props: {}};

const globalState = {
  modal: defaultModal,
};

const reducer = (state: MenuState, action: Action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        cartOpen: false,
        desktopMenuOpen: false,
        mobileMenuOpen: false,
        modal: {
          children: action.payload.children,
          props: {...action.payload.props},
        },
        searchOpen: false,
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: defaultModal,
      };
    default:
      throw new Error(`Invalid Context action of type: ${action.type}`);
  }
};

const actions = (dispatch: Dispatch) => ({
  openModal: (children: ReactNode, props?: Record<string, any>) => {
    dispatch({type: 'OPEN_MODAL', payload: {children, props}});
  },
  closeModal: () => {
    dispatch({type: 'CLOSE_MODAL'});
  },
});

export function MenuProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(reducer, globalState);

  const value = useMemo(() => ({state, actions: actions(dispatch)}), [state]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
