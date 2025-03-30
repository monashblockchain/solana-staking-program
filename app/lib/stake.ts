/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stake.json`.
 */
export type Stake = {
    "address": "EGn97R6FkiA9HGRQzrrpL2w7XWY11cmUvHbtYPC6XcCR",
    "metadata": {
      "name": "stake",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "claim",
        "discriminator": [
          62,
          198,
          214,
          193,
          213,
          159,
          108,
          210
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "stakeVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeVaultAuthority",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104,
                    111,
                    114,
                    105,
                    116,
                    121
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeRewardToken",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    114,
                    101,
                    119,
                    97,
                    114,
                    100,
                    95,
                    116,
                    111,
                    107,
                    101,
                    110
                  ]
                }
              ]
            }
          },
          {
            "name": "userAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "stakeVault"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "userStakeRewardTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "stakeRewardToken"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "deposit",
        "discriminator": [
          242,
          35,
          198,
          137,
          82,
          225,
          242,
          182
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "stakeVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeVaultAuthority",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104,
                    111,
                    114,
                    105,
                    116,
                    121
                  ]
                }
              ]
            }
          },
          {
            "name": "userAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "stakeVault"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "stakeRewardToken",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    114,
                    101,
                    119,
                    97,
                    114,
                    100,
                    95,
                    116,
                    111,
                    107,
                    101,
                    110
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeVaultAuthority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104,
                    111,
                    114,
                    105,
                    116,
                    121
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                }
              ]
            }
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "withdraw",
        "discriminator": [
          183,
          18,
          70,
          156,
          148,
          109,
          161,
          34
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "stakeVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                }
              ]
            }
          },
          {
            "name": "stakeVaultAuthority",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    107,
                    101,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104,
                    111,
                    114,
                    105,
                    116,
                    121
                  ]
                }
              ]
            }
          },
          {
            "name": "userAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "stakeVault"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "stakeVault",
        "discriminator": [
          192,
          112,
          65,
          125,
          129,
          151,
          173,
          226
        ]
      },
      {
        "name": "userAccount",
        "discriminator": [
          211,
          33,
          136,
          16,
          186,
          110,
          242,
          127
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "insufficientFunds",
        "msg": "Insufficient funds for withdrawal"
      },
      {
        "code": 6001,
        "name": "invalidOwner",
        "msg": "Invalid owner"
      },
      {
        "code": 6002,
        "name": "invalidVault",
        "msg": "Invalid vault"
      },
      {
        "code": 6003,
        "name": "minimumStakeDurationNotMet",
        "msg": "Minimum stake duration not met"
      }
    ],
    "types": [
      {
        "name": "stakeVault",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "pubkey"
            },
            {
              "name": "stakeVault",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "userAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "pubkey"
            },
            {
              "name": "stakeVault",
              "type": "pubkey"
            },
            {
              "name": "stakeAmount",
              "type": "u64"
            },
            {
              "name": "lastClaimTime",
              "type": "i64"
            }
          ]
        }
      }
    ]
  };
  