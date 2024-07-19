"use client";

import { useReducer, useRef } from "react";
import { useActions } from "ai/rsc";

import type { ServerAI } from "../_ai/actions";

type State = {
  status: "idle" | "picture-confirmation" | "analysis";
  picture: string | null;
  thoughtsUI: React.ReactNode | null;
};

type Action =
  | { type: "set-picture"; payload: string }
  | { type: "unset-picture" }
  | {
      type: "start-analysis";
      payload: {
        thoughtsUI: React.ReactNode;
      };
    };

function generativeAreaReducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-picture":
      return {
        ...state,
        status: "picture-confirmation",
        picture: action.payload,
      };
    case "unset-picture":
      return { ...state, status: "idle", picture: null };
    case "start-analysis":
      return {
        ...state,
        status: "analysis",
        thoughtsUI: action.payload.thoughtsUI,
      };
    default:
      return state;
  }
}

export type GenerativeAreaProps = {
  children: (props: {
    state: State;
    startPictureUpload: (type: "default" | "capture") => void;
    startAnalysis: () => Promise<void>;
    retakePicture: () => void;
  }) => React.ReactNode;
};

export function GenerativeArea({ children }: GenerativeAreaProps) {
  const { streamFirstAnalysisComponents } = useActions<ServerAI>();
  const captureInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(generativeAreaReducer, {
    status: "idle",
    picture: null,
    thoughtsUI: null,
  });

  function startPictureUpload(type: "default" | "capture") {
    if (type === "capture") {
      captureInputRef.current?.click();
    } else {
      diskInputRef.current?.click();
    }
  }

  function retakePicture() {
    dispatch({ type: "unset-picture" });
    if (captureInputRef.current && diskInputRef.current) {
      captureInputRef.current.value = "";
      diskInputRef.current.value = "";
    }
  }

  async function startAnalysis() {
    if (state.picture) {
      const result = await streamFirstAnalysisComponents(state.picture);
      dispatch({
        type: "start-analysis",
        payload: {
          thoughtsUI: result.thoughtsUI,
        },
      });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "set-picture",
        payload: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        ref={captureInputRef}
        hidden
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        ref={diskInputRef}
        hidden
      />
      {children({ state, startPictureUpload, startAnalysis, retakePicture })}
    </>
  );
}
