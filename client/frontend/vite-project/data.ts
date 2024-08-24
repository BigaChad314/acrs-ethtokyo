type Edge = [string, string, number];

type GraphData = {
  edges: Edge[];
};

export const graphData: GraphData = {
  edges: [
    // Community 1
    [
      "0x8300BF4586F9E05deb42764d244eD684887DB056",
      "0x99Ce8af408f7615E262d7DEC7f5ba293a9F89ceb",
      3,
    ], // nodes[0] -> ADDRESS_1, nodes[1] -> ADDRESS_2
    [
      "0x99Ce8af408f7615E262d7DEC7f5ba293a9F89ceb",
      "0x8331F89681A0395BD9293bb28E6a268a429925a7",
      5,
    ], // nodes[1] -> ADDRESS_2, nodes[2] -> ADDRESS_3
    [
      "0x8331F89681A0395BD9293bb28E6a268a429925a7",
      "0xe74b3831e9a3f8CB70c6600c177cd021259e3843",
      4,
    ], // nodes[2] -> ADDRESS_3, nodes[3] -> ADDRESS_4
    [
      "0xe74b3831e9a3f8CB70c6600c177cd021259e3843",
      "0x8300BF4586F9E05deb42764d244eD684887DB056",
      6,
    ], // nodes[3] -> ADDRESS_4, nodes[0] -> ADDRESS_1
    [
      "0x8300BF4586F9E05deb42764d244eD684887DB056",
      "0x73d2544Fe05064bA9A00d0F5a51c28F48f07AAdD",
      7,
    ], // nodes[0] -> ADDRESS_1, nodes[4] -> ADDRESS_5
    [
      "0x73d2544Fe05064bA9A00d0F5a51c28F48f07AAdD",
      "0x8331F89681A0395BD9293bb28E6a268a429925a7",
      2,
    ], // nodes[4] -> ADDRESS_5, nodes[2] -> ADDRESS_3

    // Community 2
    [
      "0x487C794d1f626BE38F47995feEC236aE733c34b5",
      "0x29332b313F9CCF835Ea4390aE96D75B7261559C9",
      8,
    ], // nodes[5] -> ADDRESS_6, nodes[6] -> ADDRESS_7
    [
      "0x29332b313F9CCF835Ea4390aE96D75B7261559C9",
      "0xCd53f43Dfdfd939Ec6D6E03B95D29061aD2AfB4F",
      5,
    ], // nodes[6] -> ADDRESS_7, nodes[7] -> ADDRESS_8
    [
      "0xCd53f43Dfdfd939Ec6D6E03B95D29061aD2AfB4F",
      "0x311e10Ca7346938f50d7D41E7b4Ba19a8CFe51Fe",
      3,
    ], // nodes[7] -> ADDRESS_8, nodes[8] -> ADDRESS_9
    [
      "0x311e10Ca7346938f50d7D41E7b4Ba19a8CFe51Fe",
      "0x487C794d1f626BE38F47995feEC236aE733c34b5",
      4,
    ], // nodes[8] -> ADDRESS_9, nodes[5] -> ADDRESS_6
    [
      "0x29332b313F9CCF835Ea4390aE96D75B7261559C9",
      "0x7e99F7e28726742573125466f40CE01651f4ab61",
      6,
    ], // nodes[6] -> ADDRESS_7, nodes[9] -> ADDRESS_10

    // Community 3
    [
      "0xE8940D1A21306fC1feF008e26407Fde3A55EB5d8",
      "0x5501254cBa34828C7a7AE4D209997dA918a836fa",
      2,
    ], // nodes[10] -> ADDRESS_11, nodes[11] -> ADDRESS_12
    [
      "0x5501254cBa34828C7a7AE4D209997dA918a836fa",
      "0xdeeD60634422E3bfC4Ed6ee2B5FF634a159dc356",
      7,
    ], // nodes[11] -> ADDRESS_12, nodes[12] -> ADDRESS_13
    [
      "0xdeeD60634422E3bfC4Ed6ee2B5FF634a159dc356",
      "0xB53C1a186B6cA40cD6a54DAc026eE8Ddc5e50082",
      5,
    ], // nodes[12] -> ADDRESS_13, nodes[13] -> ADDRESS_14
    [
      "0xB53C1a186B6cA40cD6a54DAc026eE8Ddc5e50082",
      "0xed12622CFB180a7C12210F90318435980926908A",
      3,
    ], // nodes[13] -> ADDRESS_14, nodes[14] -> ADDRESS_15
    [
      "0xed12622CFB180a7C12210F90318435980926908A",
      "0xE8940D1A21306fC1feF008e26407Fde3A55EB5d8",
      4,
    ], // nodes[14] -> ADDRESS_15, nodes[10] -> ADDRESS_11

    // Inter-community connections
    [
      "0xe74b3831e9a3f8CB70c6600c177cd021259e3843",
      "0x29332b313F9CCF835Ea4390aE96D75B7261559C9",
      5,
    ], // nodes[3] -> ADDRESS_4, nodes[6] -> ADDRESS_7
    [
      "0xCd53f43Dfdfd939Ec6D6E03B95D29061aD2AfB4F",
      "0xE8940D1A21306fC1feF008e26407Fde3A55EB5d8",
      6,
    ], // nodes[7] -> ADDRESS_8, nodes[10] -> ADDRESS_11
    [
      "0xdeeD60634422E3bfC4Ed6ee2B5FF634a159dc356",
      "0x99Ce8af408f7615E262d7DEC7f5ba293a9F89ceb",
      3,
    ], // nodes[12] -> ADDRESS_13, nodes[1] -> ADDRESS_2
    [
      "0x7e99F7e28726742573125466f40CE01651f4ab61",
      "0xB53C1a186B6cA40cD6a54DAc026eE8Ddc5e50082",
      4,
    ], // nodes[9] -> ADDRESS_10, nodes[13] -> ADDRESS_14

    // Additional connections
    [
      "0x73d2544Fe05064bA9A00d0F5a51c28F48f07AAdD",
      "0x7e99F7e28726742573125466f40CE01651f4ab61",
      6,
    ], // nodes[4] -> ADDRESS_5, nodes[9] -> ADDRESS_10
    [
      "0x311e10Ca7346938f50d7D41E7b4Ba19a8CFe51Fe",
      "0x8300BF4586F9E05deb42764d244eD684887DB056",
      5,
    ], // nodes[8] -> ADDRESS_9, nodes[0] -> ADDRESS_1
  ],
};
