import { FunctionComponent, useEffect, useReducer } from "react";
import { Entry } from "../../interfaces";
import { entriesReducer } from "./";
import { EntriesContext } from "./EntriesContex";
import { v4 as uuidv4 } from "uuid";
import { entriesApi } from "../../apis";
import { useSnackbar } from "notistack";
export interface EntriesState {
  entries: Entry[];
}
const uuid = uuidv4();

const ENTRIES_INITIAL_STATE: EntriesState = {
  entries: [],
};

export const EntriesProvider: FunctionComponent<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(entriesReducer, ENTRIES_INITIAL_STATE);
  const addNewEntry = async (description: string) => {
    // const newEntry: Entry = {
    //   _id: uuidv4(),
    //   description,
    //   createAt: Date.now(),
    //   status: "pending",
    // };
    const { data } = await entriesApi.post<Entry>("/entries", { description });
    dispatch({ type: "[Entry] Add-Entry", payload: data });
  };
  const updateEntry = async (
    { _id, description, status }: Entry,
    showSnackbar = false
  ) => {
    try {
      const { data } = await entriesApi.put<Entry>(`/entries/${_id}`, {
        description,
        status,
      });

      if (showSnackbar) {
        enqueueSnackbar("Entrada Actualizada", {
          variant: "success",
          autoHideDuration: 1500,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }

      dispatch({ type: "[Entry] Updated-Entry", payload: data });
    } catch (error) {
      console.log({ error });
    }
  };
  const refreshEntries = async () => {
    const { data } = await entriesApi.get<Entry[]>("entries/");
    dispatch({ type: "[Entry] Refresh-Entry", payload: data });
  };
  useEffect(() => {
    refreshEntries();
  }, []);

  return (
    <EntriesContext.Provider
      value={{
        ...state,
        addNewEntry,
        updateEntry,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
};
