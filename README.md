# spherex-helper-scripts

configureProtecteContracts.js
this script configure the operator, engine and protected sigs for each contract in the contracts data file given.
in order to run the script, change the four settings at the top of the scripts:
const SPHEREX_OPERATOR_ADDRESS = "0x0000000000000000000000000000000000001337";
const SPHEREX_ENGINE_ADDRESS = "0x0000000000000000000000000000000000001337";
const CONTRACTS_DATA_PATH = "";
const LOCAL_FORK = true;

the contracts_data file should be provided to u by the spherex team.
