import React, { useState, createContext } from "react";

export const OperationContext = createContext();

export const OperationContextProvider = (props) => {
  const [operations, setOperations] = useState([]);
  const [dt_operations, dt_setOperations] = useState([]);
  const [results, setResults] = useState([]);
  const [wordResults, setWordResults] = useState([]);
  const [dt_results, dt_setResults] = useState([]);
  const [dt_wordResults, dt_setWordResults] = useState([]);
  const addOperations = (new_op) => {
    setOperations([...operations, new_op]);
  };

  const dt_addOperations = (new_dt_op) => {
    dt_setOperations([...dt_operations,new_dt_op ]);
  };
  

  return (
    <OperationContext.Provider value = {{operations, setOperations, dt_operations, dt_setOperations, results, setResults, wordResults, setWordResults,
      dt_results, dt_setResults, dt_wordResults, dt_setWordResults, addOperations, dt_addOperations  
      }}>

      {props.children}
    </OperationContext.Provider>
  );
};