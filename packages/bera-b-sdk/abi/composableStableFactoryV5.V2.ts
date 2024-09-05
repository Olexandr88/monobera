export const composableStableFactoryV5Abi_V2 = [
  {
    inputs: [
      { internalType: "contract IVault", name: "vault", type: "address" },
      {
        internalType: "contract IProtocolFeePercentagesProvider",
        name: "protocolFeeProvider",
        type: "address",
      },
      { internalType: "string", name: "factoryVersion", type: "string" },
      { internalType: "string", name: "poolVersion", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { anonymous: false, inputs: [], name: "FactoryDisabled", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "amplificationParameter",
        type: "uint256",
      },
      {
        internalType: "contract IRateProvider[]",
        name: "rateProviders",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenRateCacheDurations",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "exemptFromYieldProtocolFeeFlag",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "swapFeePercentage",
        type: "uint256",
      },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
    ],
    name: "create",
    outputs: [
      {
        internalType: "contract ComposableStablePool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "disable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "selector", type: "bytes4" }],
    name: "getActionId",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuthorizer",
    outputs: [
      { internalType: "contract IAuthorizer", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreationCode",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreationCodeContracts",
    outputs: [
      { internalType: "address", name: "contractA", type: "address" },
      { internalType: "address", name: "contractB", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPauseConfiguration",
    outputs: [
      {
        internalType: "uint256",
        name: "pauseWindowDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bufferPeriodDuration",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolVersion",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProtocolFeePercentagesProvider",
    outputs: [
      {
        internalType: "contract IProtocolFeePercentagesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVault",
    outputs: [{ internalType: "contract IVault", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isDisabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "pool", type: "address" }],
    name: "isPoolFromFactory",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
