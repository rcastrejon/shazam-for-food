import { createContext, useContext, useReducer } from "react";

export type GenerativeAreaState = {
  picture: string | null;
};

export type GenerativeAreaAction =
  | {
      type: "SET_PICTURE";
      payload: string;
    }
  | {
      type: "UNSET_PICTURE";
    };

function generativeAreaReducer(
  state: GenerativeAreaState,
  action: GenerativeAreaAction,
) {
  switch (action.type) {
    case "SET_PICTURE":
      return {
        picture: action.payload,
      };
    case "UNSET_PICTURE":
      return {
        picture: null,
      };
    default:
      return state;
  }
}

const GenerativeAreaContext = createContext<{
  state: GenerativeAreaState;
  dispatch: React.Dispatch<GenerativeAreaAction>;
} | null>(null);

export type GenerativeAreaProviderProps = {
  children: React.ReactNode;
};

export function GenerativeAreaProvider({
  children,
}: GenerativeAreaProviderProps) {
  const [state, dispatch] = useReducer(generativeAreaReducer, {
    picture: null,
  });

  return (
    <GenerativeAreaContext.Provider value={{ state, dispatch }}>
      {children}
    </GenerativeAreaContext.Provider>
  );
}

export const useGenerativeArea = () => {
  const context = useContext(GenerativeAreaContext);

  if (!context) {
    throw new Error(
      "useGenerativeArea must be used within a GenerativeAreaProvider",
    );
  }

  return context;
};
